const { v4: uuidv4 } = require("uuid");
const events = require("events");
const chalk = require("chalk");
const querystring = require("querystring");

const Room = require("./models/room.model");

const USE_DEBUGGER = true; // print contents of every room for every ping
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

  console.log(
    chalk.greenBright(
      `Client ${socket.id} has connected to roomID ${socket.roomID}.`
    )
  );
};

/*
  Remove client, and if it is the last client in a room,
  delete the room too.
*/
Hub.removeClient = function (clientID) {
  if (!Hub.connections.has(clientID)) return;

  const roomID = Hub.connections.get(clientID).roomID;
  if (roomID == undefined || !Hub.rooms.has(roomID)) {
    console.error(
      "Error while removing client: RoomID stored under client is invalid"
    );
    return;
  }

  Hub.connections.delete(clientID);
  Hub.rooms.get(roomID).delete(clientID);

  console.log(
    chalk.red(`Client ${clientID} has disconnected from roomID ${roomID}.`)
  );

  if (Hub.rooms.get(roomID).size <= 0) {
    Hub.rooms.delete(roomID);
    console.log(chalk.red(`Removed roomID ${roomID} from hub.`));
  }
};

Hub.send = function (id, roomID, data) {
  if (!Hub.rooms.has(roomID)) {
    return;
  }

  Hub.rooms.get(roomID).forEach((state, client) => {
    let socket = Hub.connections.get(client);

    if ((data.sendResponse && client === id) || client != id) {
      socket.send(JSON.stringify(data));
    }
  });
};

Hub.addItem = async function ({ socket, roomID, data, sendResponse }) {
  console.log(chalk.greenBright(`Adding item to roomID ${roomID}`));

  const item = await Room.addItem(roomID, data);

  Hub.send(socket.id, roomID, {
    event: "itemAdded",
    sendResponse,
    data: item,
  });
};

Hub.updateItems = function ({ socket, roomID, data, sendResponse }) {
  console.log(chalk.greenBright(`Updating items in roomID ${roomID}`));

  if (data.items !== undefined && data.items.length > 0) {
    // Convert array of updates to single object of form { itemID_1 : updates, itemID_2 : updates ... }
    const items = data.items.reduce(
      (obj, item) => ((obj[item.id] = item.updated), obj),
      {}
    );
    Room.updateItems(roomID, items);

    Hub.send(socket.id, roomID, {
      event: "itemsUpdated",
      sendResponse,
      data,
    });
  }
};

Hub.deleteItem = function ({ socket, roomID, data, sendResponse }) {
  console.log(chalk.greenBright(`Deleting item in roomID ${roomID}`));

  if (data === undefined || data.id === undefined) return;

  Room.removeItem(roomID, data.id);

  Hub.send(socket.id, roomID, {
    event: "itemDeleted",
    sendResponse,
    data,
  });
};

Hub.updateLayout = function ({ socket, roomID, data, sendResponse }) {
  console.log(chalk.greenBright(`Updating layout of roomID ${roomID}`));

  if (data.vertices === undefined || data.vertices.length <= 0) return;

  Room.updateVertices(roomID, data.vertices);

  Hub.send(socket.id, roomID, {
    event: "layoutUpdated",
    sendResponse,
    data,
  });
};

Hub.cloneRoom = async function ({ socket, roomID, data, sendResponse }) {
  const target = data.target_id;

  console.log(chalk.greenBright(`Cloning template ${target} into ${roomID}`));

  await Room.copyFrom(roomID, target);

  Hub.send(socket.id, roomID, {
    event: "roomCloned",
    sendResponse,
    data,
  });
};

Hub.updateRoomName = async function ({ socket, roomID, data, sendResponse }) {
  console.log(chalk.greenBright(`Updating name of roomID ${roomID}`));

  if (data.name === undefined || data.name.length <= 0) return;

  await Room.updateRoomName(roomID, data.name);

  Hub.send(socket.id, roomID, {
    event: "roomNameUpdated",
    sendResponse,
    data,
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
  console.log("PARAMS " + params["/ws?id"]);
  socket.active = true;

  Hub.addClient(socket);

  socket.on("pong", function onPing() {
    socket.active = true;
  });

  socket.on("close", () => {
    Hub.removeClient(socket.id);
  });

  socket.on("message", (msg) => {
    const res = JSON.parse(msg);
    const { event, sendResponse, data } = res;

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
  Hub.events.addListener("updateRoomName", Hub.updateRoomName);

  sockets.on("connection", Hub.onConnection);

  setInterval(Hub.onPing, PONG_TIME);
};

module.exports = Hub;
