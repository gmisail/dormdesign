const { v4: uuidv4 } = require("uuid");
const events = require("events");
const chalk = require("chalk");
const querystring = require("querystring");

const Room = require("./models/room.model");
const Cache = require("./cache");
const Users = require("./models/users.model");

/*
  Clear the cache upon server startup

  TODO: remove this once multi-core support is implemented since this
  will clear the cache whenever a new server node is added --> could be
  very bad.
*/
Cache.client.flushall();

const USE_DEBUGGER = false; // print contents of every room for every ping
const PONG_TIME = 15 * 1000; // check every 15 seconds

let Hub = {};
Hub.connections = new Map();
Hub.rooms = new Map();

/*
  If room does not exist, create it and add the client. If it does,
  just add the client to the existing room.
*/
Hub.addClient = function (socket) {
  Hub.connections.set(socket.id, socket);

  if (!Hub.rooms.has(socket.roomID)) {
    Hub.rooms.set(socket.roomID, new Map());
  }

  Hub.rooms.get(socket.roomID).set(socket.id, true);

  Users.add(socket.roomID, socket.id, "?");

  console.log(chalk.greenBright(`Client ${socket.id} has connected to roomID ${socket.roomID}.`));
};

/*
  Remove client, and if it is the last client in a room,
  delete the room too.
*/
Hub.removeClient = async function (clientID) {
  if (!Hub.connections.has(clientID)) return;

  const roomID = Hub.connections.get(clientID).roomID;
  if (roomID === undefined || !Hub.rooms.has(roomID)) {
    console.error("Error while removing client: RoomID stored under client is invalid");
    return;
  }

  Room.save(roomID);

  Hub.connections.delete(clientID);
  Hub.rooms.get(roomID).delete(clientID);

  await Users.remove(roomID, clientID);
  let users = await Users.inRoom(roomID);

  Hub.send(clientID, roomID, false, {
    event: "nicknamesUpdated",
    data: { users },
  });

  console.log(chalk.red(`Client ${clientID} has disconnected from roomID ${roomID}.`));

  if (Hub.rooms.get(roomID).size <= 0) {
    Hub.rooms.delete(roomID);

    Cache.client
      .del(roomID)
      .then((_) => console.log(`Room ${roomID} has been removed from the cache.`));

    await Users.deleteRoom(roomID);

    console.log(chalk.red(`Removed roomID ${roomID} from hub.`));
  }
};

/**
 * Send a socket message to a client by ID
 * @param { string } id
 * @param { object } data
 * @returns none
 */
Hub.sendToClient = function (id, data) {
  if (id === undefined || !Hub.connections.has(id)) {
    console.error("Error while sending data to client: invalid ID.");
    return;
  }

  let socket = Hub.connections.get(id);

  socket.send(JSON.stringify(data));
};

/**
 * Send a socket message to an entire room, similar to broadcast.
 * @param { string } senderID
 * @param { string } roomID
 * @param { object } data
 * @returns none
 */
Hub.send = function (senderID, roomID, sendResponse, data) {
  if (!Hub.rooms.has(roomID)) {
    return;
  }

  Hub.rooms.get(roomID).forEach((state, client) => {
    let socket = Hub.connections.get(client);

    if ((sendResponse && client === senderID) || client !== senderID) {
      socket.send(JSON.stringify(data));
    }
  });
};

/**
 * Sends an error message to a client by ID
 * @param { string } id
 * @param { string } errorAction
 * @param { string } errorMessage
 */
Hub.sendError = function (id, errorAction, errorMessage) {
  if (id === undefined) {
    console.error("Cannot send error to client: invalid ID.");
    return;
  }

  if (errorMessage === undefined || errorAction === undefined) {
    console.error("Cannot send error to client: invalid error message / action.");
    return;
  }

  const response = {
    event: "actionFailed",
    data: {
      action: errorAction,
      message: errorMessage,
    },
  };

  Hub.sendToClient(id, response);
};

Hub.addItem = async function ({ socket, roomID, data, sendResponse }) {
  const item = await Room.addItem(roomID, data);

  if (item === null) {
    Hub.sendError(socket.id, "addItem", "Unable to add item to the database nor room.");
    return;
  }

  Hub.send(socket.id, roomID, sendResponse, {
    event: "itemAdded",
    data: item,
  });
};

Hub.updateItems = async function ({ socket, roomID, data, sendResponse }) {
  if (data.items !== undefined && data.items.length > 0) {
    // Convert array of updates to single object of form { itemID_1 : updates, itemID_2 : updates ... }
    const items = data.items.reduce((obj, item) => ((obj[item.id] = item.updated), obj), {});

    try {
      await Room.updateItems(roomID, items);
    } catch (error) {
      Hub.sendError(socket.id, "updateItems", error.message);

      return;
    }

    Hub.send(socket.id, roomID, sendResponse, {
      event: "itemsUpdated",
      data,
    });
  }
};

Hub.deleteItem = async function ({ socket, roomID, data, sendResponse }) {
  if (data === undefined || data.id === undefined) {
    Hub.sendError(socket.id, "deleteItem", "Could not delete item with undefined ID.");
    return;
  }

  try {
    await Room.removeItem(roomID, data.id);
  } catch (error) {
    Hub.sendError(socket.id, "deleteItem", error.message);

    return;
  }

  Hub.send(socket.id, roomID, sendResponse, {
    event: "itemDeleted",
    data,
  });
};

Hub.updateLayout = async function ({ socket, roomID, data, sendResponse }) {
  if (data.vertices === undefined || data.vertices.length <= 0) {
    Hub.sendError(
      socket.id,
      "updateLayout",
      "Cannot update layout with undefined / empty vertices."
    );

    return;
  }

  try {
    await Room.updateVertices(roomID, data.vertices);
  } catch (error) {
    Hub.sendError(socket.id, "updateLayout", error.message);

    return;
  }

  Hub.send(socket.id, roomID, sendResponse, {
    event: "layoutUpdated",
    data,
  });
};

Hub.cloneRoom = async function ({ socket, roomID, data, sendResponse }) {
  const target = data.target_id;

  let res = {};

  try {
    res = await Room.copyFrom(roomID, target);
  } catch (error) {
    Hub.sendError(socket.id, "cloneRoom", "Could not clone room successfully.");

    return;
  }

  Hub.send(socket.id, roomID, sendResponse, {
    event: "roomCloned",
    data,
  });
};

Hub.updateRoomName = async function ({ socket, roomID, data, sendResponse }) {
  if (data === undefined || data.name === undefined || data.name.length <= 0) return;

  let name = data.name.trim().substring(0, Math.min(40, data.name.length));

  try {
    await Room.updateRoomName(roomID, name);
  } catch (error) {
    Hub.sendError(socket.id, "updateRoomName", "Could not update room name.");

    return;
  }

  Hub.send(socket.id, roomID, sendResponse, {
    event: "roomNameUpdated",
    data,
  });
};

Hub.deleteRoom = async function ({ socket, roomID, sendResponse }) {
  Room.delete(roomID);
  await Users.deleteRoom(roomID);

  Hub.send(socket.id, roomID, sendResponse, {
    event: "roomDeleted",
    data: {},
  });
};

/*
  Add a nickname (also referred to as usernames) to the room, or updates a name if it already exists at a given socket ID. Sends to 
  every client the array of users
*/
Hub.updateNickname = async function ({ socket, roomID, data, sendResponse }) {
  if (data === undefined || data.userName === undefined || data.userName.length <= 0) return;

  let userName = data.userName.trim();

  await Users.add(socket.roomID, socket.id, userName);

  let users = await Users.inRoom(socket.roomID);

  Hub.send(socket.id, roomID, sendResponse, {
    event: "nicknamesUpdated",
    data: { users },
  });
};

/*
  Called every PONG_TIME milliseconds. This is to check if
  every socket is still alive. If not, then remove the client.
*/
Hub.onPing = function () {
  for (let [id, socket] of Hub.connections) {
    /*
      If inactive:
      - remove the client from the current roomID
      - terminate the socket connection
    */
    if (!socket.active) {
      console.log("Connection " + socket.id + " inactive. Closing it.");
      Hub.removeClient(socket.id, socket.roomID);
      return socket.terminate();
    }

    socket.active = false;
    socket.ping(() => {});
  }

  if (!USE_DEBUGGER) return;

  if (Hub.rooms.size > 0) {
    console.log(chalk.bgGray("============== Rooms  =============="));

    Hub.rooms.forEach((clients, roomID) => {
      console.log(chalk.blue(roomID));
    });
  }
};

/*
  Called when socket is initially connected. Used for setting
  up the socket events.
*/
Hub.onConnection = function (socket, req) {
  const id = uuidv4();
  const url = req.url;
  const params = querystring.parse(url);

  /*
    Add the id, roomID, and active properties to the socket object so that
    it's easier to look up which room this socket needs to send data to.
  */
  socket.id = id;
  socket.roomID = params["/ws?id"];
  socket.active = true;

  Hub.addClient(socket);

  socket.on("pong", function onPing() {
    socket.active = true;
  });

  socket.on("close", () => {
    Hub.removeClient(socket.id);
  });

  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    const { event, sendResponse, data } = message;

    // emit the event with the data that was sent to the server & the socket's id
    Hub.events.emit(event, {
      socket,
      roomID: socket.roomID,
      sendResponse,
      id: socket.id,
      data,
    });
  });
};

/**
 * Setup the socket hub, which directs incoming socket messages to the correct callback
 * @param {*} sockets
 */
Hub.setup = function (sockets) {
  console.log("Starting socket server");

  Hub.sockets = sockets;
  Hub.events = new events.EventEmitter();

  /* register the socket events */
  Hub.events.addListener("addItem", Hub.addItem);
  Hub.events.addListener("updateItems", Hub.updateItems);
  Hub.events.addListener("deleteItem", Hub.deleteItem);
  Hub.events.addListener("updateLayout", Hub.updateLayout);
  Hub.events.addListener("cloneRoom", Hub.cloneRoom);
  Hub.events.addListener("deleteRoom", Hub.deleteRoom);
  Hub.events.addListener("updateRoomName", Hub.updateRoomName);
  Hub.events.addListener("updateNickname", Hub.updateNickname);

  sockets.on("connection", Hub.onConnection);

  setInterval(Hub.onPing, PONG_TIME);
};

module.exports = Hub;
