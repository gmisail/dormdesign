const { v4: uuidv4, validate } = require("uuid");
const events = require("events");
const chalk = require("chalk");
const querystring = require("querystring");

const Room = require("./models/room.model");

const DEBUG_MESSAGES = Boolean(process.env.DEBUG_MESSAGES ?? "false");

const USE_DEBUGGER = true; // print contents of every room for every ping
const PONG_TIME = 15 * 1000; // check every 15 seconds

let Hub = {};
// { socketId : socket } - Stores active socket connections
Hub.connections = new Map();
// { roomId : { socketId } } - Stores set of socket connection ids for each room
Hub.rooms = new Map();

/*
  Returns an array of username strings for active sockets in a room
*/
Hub.getRoomUsernames = function (roomID) {
  return [...Hub.rooms.get(roomID)].map((socketId) => {
    return Hub.connections.get(socketId).userName;
  });
};

/*
  If room does not exist, create it and add the client. If it does,
  just add the client to the existing room.
*/
Hub.addClient = async function (socket) {
  Hub.connections.set(socket.id, socket);

  if (!Hub.rooms.has(socket.roomID)) {
    Hub.rooms.set(socket.roomID, new Set());
  }

  const inCache = await Room.Cache.exists(socket.roomID);
  if (!inCache) {
    Room.Cache.add(socket.roomID);
  }

  Hub.rooms.get(socket.roomID).add(socket.id);

  const users = Hub.getRoomUsernames(socket.roomID);
  Hub.sendToRoom(socket.id, true, {
    event: "nicknamesUpdated",
    data: { users },
  });

  console.log(chalk.greenBright(`Client ${socket.id} has connected to roomID ${socket.roomID}.`));
};

/*
  Remove client, and if it is the last client in a room,
  delete the room from the cache too.
*/
Hub.removeClient = async function (clientID) {
  if (!Hub.connections.has(clientID)) return;

  const roomID = Hub.connections.get(clientID).roomID;
  if (roomID === undefined || !Hub.rooms.has(roomID)) {
    console.error("Error while removing client: RoomID stored under client is invalid");
    return;
  }

  Hub.rooms.get(roomID).delete(clientID);
  // It's important that the nicknames update is sent BEFORE the clientID is deleted from the connections map.
  // Otherwise the message would fail to send since this client ID is no longer valid
  const users = Hub.getRoomUsernames(roomID);
  Hub.sendToRoom(clientID, false, {
    event: "nicknamesUpdated",
    data: { users },
  });
  Hub.connections.delete(clientID);

  if (DEBUG_MESSAGES) {
    console.log(chalk.red(`Client ${clientID} has disconnected from roomID ${roomID}.`));
  }

  if (Hub.rooms.get(roomID).size === 0) {
    try {
      await Room.Cache.save(roomID);
    } catch (error) {
      console.error(error);
    }

    Hub.rooms.delete(roomID);
    const removed = Room.Cache.remove(roomID);
    // Sometimes the room might have already been removed from the cache (e.g. when a room is fully deleted)
    if (removed > 0 && DEBUG_MESSAGES)
      console.log(`Room ${roomID} has been removed from the cache.`);
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
 * Send a socket message to an entire room, similar to broadcast. The message will be sent to whatever room
 * the given `senderID` belongs to
 * @param { string } senderID Client ID of sender.
 * @param { boolean } includeSender If true, will also send message to sender
 * @param { object } data
 * @returns none
 */
Hub.sendToRoom = function (senderID, includeSender, data) {
  const roomID = Hub.connections.get(senderID).roomID;

  Hub.rooms.get(roomID).forEach((clientID) => {
    let socket = Hub.connections.get(clientID);

    if ((includeSender && clientID === senderID) || clientID !== senderID) {
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
  if (data === undefined) {
    const err = new Error("Item data is undefined");
    err.status = 400;
    throw err;
  }
  const item = await Room.Cache.addItem(roomID, data);

  Hub.sendToRoom(socket.id, sendResponse, {
    event: "itemAdded",
    data: item,
  });
};

Hub.updateItems = async function ({ socket, roomID, data, sendResponse }) {
  if (data?.items === undefined) {
    const err = new Error("Array 'items' is undefined");
    err.status = 400;
    throw err;
  }

  await Room.Cache.updateItems(roomID, data.items);

  Hub.sendToRoom(socket.id, sendResponse, {
    event: "itemsUpdated",
    data,
  });
};

Hub.deleteItem = async function ({ socket, roomID, data, sendResponse }) {
  if (data?.id === undefined) {
    const err = new Error("Item ID is undefined");
    err.status = 400;
    throw err;
  }

  try {
    await Room.Cache.removeItem(roomID, data.id);
  } catch (error) {
    Hub.sendError(socket.id, "deleteItem", error.message);
    return;
  }

  Hub.sendToRoom(socket.id, sendResponse, {
    event: "itemDeleted",
    data,
  });
};

Hub.updateLayout = async function ({ socket, roomID, data, sendResponse }) {
  if (data?.vertices === undefined || data.vertices.length === 0) {
    const err = new Error("'vertices' array is empty or undefined");
    err.status = 400;
    throw err;
  }

  await Room.Cache.updateVertices(roomID, data.vertices);

  Hub.sendToRoom(socket.id, sendResponse, {
    event: "layoutUpdated",
    data,
  });
};

Hub.cloneRoom = async function ({ socket, roomID, data, sendResponse }) {
  if (data?.templateId === undefined) {
    const err = new Error("'templateId' is undefined");
    err.status = 400;
    throw err;
  }
  const templateId = data.templateId;

  await Room.Cache.copyFrom(roomID, templateId);

  Hub.sendToRoom(socket.id, sendResponse, {
    event: "roomCloned",
    data,
  });
};

Hub.updateRoomName = async function ({ socket, roomID, data, sendResponse }) {
  if (data === undefined || data.name === undefined || data.name.length <= 0) {
    const err = new Error("'name' string is empty or undefined");
    err.status = 400;
    throw err;
  }

  let name = data.name.trim().substring(0, Math.min(30, data.name.length));
  await Room.Cache.updateData(roomID, { name: name });

  Hub.sendToRoom(socket.id, sendResponse, {
    event: "roomNameUpdated",
    data,
  });
};

Hub.deleteRoom = async function ({ socket, roomID, sendResponse }) {
  Room.delete(roomID);

  Hub.sendToRoom(socket.id, sendResponse, {
    event: "roomDeleted",
    data: {},
  });
};

/*
  Add a nickname (also referred to as usernames) to the room, or updates a name if it already exists at a given socket ID. Sends to 
  every client the array of users
*/
Hub.updateNickname = async function ({ socket, roomID, data, sendResponse }) {
  if (data === undefined || data.userName === undefined || data.userName.length <= 0) {
    const err = new Error("'userName' string is empty or undefined");
    err.status = 400;
    throw err;
  }

  // Update socket's username
  socket.userName = data.userName.trim();

  // Get all usernames in the room
  const users = Hub.getRoomUsernames(roomID);

  Hub.sendToRoom(socket.id, sendResponse, {
    event: "nicknamesUpdated",
    data: { users },
  });
};

/*
  Called every PONG_TIME milliseconds. This is to check if
  every socket is still alive. If not, then remove the client.
*/
Hub.onPing = async function () {
  for (let [id, socket] of Hub.connections) {
    /*
      If inactive:
      - remove the client from the current roomID
      - terminate the socket connection
    */
    if (!socket.active) {
      if (DEBUG_MESSAGES) console.log("Connection " + socket.id + " inactive. Closing it.");
      await Hub.removeClient(socket.id);
      socket.terminate();
    }

    socket.active = false;
    socket.ping(() => {});
  }

  if (!USE_DEBUGGER) return;

  if (Hub.rooms.size > 0) {
    console.log(chalk.bgGray("============== Rooms  =============="));

    Hub.rooms.forEach((_, roomID) => {
      console.log(chalk.blue(roomID));
    });
  }
};

/*
  Called when socket is initially connected. Used for setting
  up the socket events.
*/
Hub.onConnection = async function (socket, req) {
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
  socket.userName = "User";

  await Hub.addClient(socket);

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
 * Custom function for adding an event listener to the hub. Wraps the listener in a function that catches and handles errors.
 * Any errors caught at this stage without a 'status' property will be interpreted as internal server errors
 */
Hub.addEventListener = (event, listener) => {
  Hub.events.addListener(event, async (args) => {
    const { socket } = args;
    try {
      /* 
        If a room event is received when the room is not in the cache, close the connection

        This handles the case where the room has been removed from the cache (e.g. when the cache has reached its memory limit), 
        but the socket connection is still open. If we didn't do this, things would still work but the frontend's data 
        may be out of sync (without the user realizing). Better to close the connection and force a refresh
      */
      const exists = await Room.Cache.exists(socket.roomID);
      if (!exists) {
        await Hub.removeClient(socket.id);
        socket.terminate();
      }

      await listener(args);
    } catch (err) {
      if (err.status === undefined) err.status = 500;
      // Internal errors shouldn't be shown to client
      if (err.status === 500) {
        console.error(`Internal error on ${event} room event.`, err);
        err.message = "Internal server error";
      } else {
        // For now also log non-internal errors. Probably want to remove this in the future
        console.error(`Error on ${event} room event.`, err.message);
      }
      Hub.sendError(socket.id, event, err.message);
    }
  });
};

/**
 * Setup the socket hub, which directs incoming socket messages to the correct callback
 * @param {*} sockets WebSocket instance
 */
Hub.setup = function (sockets) {
  console.log("Starting socket server");

  Hub.sockets = sockets;
  Hub.events = new events.EventEmitter();

  /* register the socket events */
  Hub.addEventListener("addItem", Hub.addItem);
  Hub.addEventListener("updateItems", Hub.updateItems);
  Hub.addEventListener("deleteItem", Hub.deleteItem);
  Hub.addEventListener("updateLayout", Hub.updateLayout);
  Hub.addEventListener("cloneRoom", Hub.cloneRoom);
  Hub.addEventListener("deleteRoom", Hub.deleteRoom);
  Hub.addEventListener("updateRoomName", Hub.updateRoomName);
  Hub.addEventListener("updateNickname", Hub.updateNickname);

  sockets.on("connection", Hub.onConnection);

  setInterval(Hub.onPing, PONG_TIME);
};

module.exports = Hub;
