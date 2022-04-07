import { EventEmitter } from "stream";
import { StatusError } from "./errors/status.error";
import chalk from "chalk";
import express from "express";
import querystring from "querystring";
import { v4 as uuidv4 } from "uuid";
import ws from "ws";

const Room = require("./models/room.model");

const DEBUG_MESSAGES = Boolean(process.env.DEBUG_MESSAGES ?? "false");
const USE_DEBUGGER = true; // print contents of every room for every ping
const PONG_TIME = 15 * 1000; // check every 15 seconds

/**
 *  Data associated with a socket connection
 */
type UserSession = {
  socket: ws.WebSocket;
  id: string;
  userName: string;
  roomID: string;
  active: boolean;
};

type EventMessage = {
  session: UserSession;
  roomID: string;
  data: any;
  sendResponse: boolean;
};

class Hub {
  private connections: Map<string, UserSession>;
  private rooms: Map<string, Set<string>>;

  private sockets: ws.Server;
  private events: EventEmitter;

  constructor(sockets: ws.Server) {
    this.events = new EventEmitter();
    this.connections = new Map<string, UserSession>();
    this.rooms = new Map<string, Set<string>>();

    console.log("Initializing socket hub...")

    /**
      Setup event callback for socket events. Note how they're encapsulated within a lambda function;
      this allows the callback to access the rest of the class (otherwise, `this` will be incorrect!)
    */
    this.addEventListener("addItem",        async (args: EventMessage) => this.addItem(args));
    this.addEventListener("updateItems",    async (args: EventMessage) => this.updateItems(args));
    this.addEventListener("deleteItem",     async (args: EventMessage) => this.deleteItem(args));
    this.addEventListener("updateLayout",   async (args: EventMessage) => this.updateLayout(args));
    this.addEventListener("cloneRoom",      async (args: EventMessage) => this.cloneRoom(args));
    this.addEventListener("deleteRoom",     async (args: EventMessage) => this.deleteRoom(args));
    this.addEventListener("updateRoomName", async (args: EventMessage) => this.updateRoomName(args));
    this.addEventListener("updateNickname", async (args: EventMessage) => this.updateNickname(args));

    this.sockets = sockets;
    this.sockets.on("connection", async (socket, request) => this.onConnection(socket, request));

    setInterval(async () => this.onPing(), PONG_TIME);
  }

  async onConnection(socket: ws.WebSocket, req: any) {
    const id = uuidv4();
    const params = new URLSearchParams(req.url);

    /*
      Add the id, roomID, and active properties to the UserSession object so that
      it's easier to look up which room this socket needs to send data to.
    */
    let session: UserSession = {
      id,
      socket,
      roomID: params.get("/ws?id"),
      active: true,
      userName: "User",
    };

    await this.addClient(session);

    session.socket.on("pong", function onPong() {
      session.active = true;
    });
    session.socket.on("close", () => this.removeClient(session.id));

    session.socket.on("message", (msg: string) => {
      const message = JSON.parse(msg);
      const { event, sendResponse, data } = message;

      // emit the event with the data that was sent to the server & the socket's id
      this.events.emit(event, {
        session,
        roomID: session.roomID,
        sendResponse,
        id: session.id,
        data,
      });
    });
  }

  async addClient(session: UserSession): Promise<void> {
    this.connections.set(session.id, session);

    if (!this.rooms.has(session.roomID)) {
      this.rooms.set(session.roomID, new Set<string>());
    }

    const inCache = await Room.Cache.exists(session.roomID);
    if (!inCache) {
      Room.Cache.add(session.roomID);
    }

    this.rooms.get(session.roomID).add(session.id);

    const users = this.getRoomUsernames(session.roomID);

    this.sendToRoom(session.id, true, {
      event: "nicknamesUpdated",
      data: { users },
    });

    console.log(
      chalk.greenBright(`Client ${session.id} has connected to roomID ${session.roomID}.`)
    );
  }

  async removeClient(clientID: string): Promise<void> {
    if (!this.connections.has(clientID)) return;

    const roomID = this.connections.get(clientID).roomID;
    if (roomID === undefined || !this.rooms.has(roomID)) {
      console.error("Error while removing client: RoomID stored under client is invalid");
      return;
    }

    this.rooms.get(roomID).delete(clientID);

    // It's important that the nicknames update is sent BEFORE the clientID is deleted from the connections map.
    // Otherwise the message would fail to send since this client ID is no longer valid
    const users = this.getRoomUsernames(roomID);

    this.sendToRoom(clientID, false, {
      event: "nicknamesUpdated",
      data: { users },
    });

    this.connections.delete(clientID);

    if (DEBUG_MESSAGES) {
      console.log(chalk.red(`Client ${clientID} has disconnected from roomID ${roomID}.`));
    }

    if (this.rooms.get(roomID).size === 0) {
      try {
        await Room.Cache.save(roomID);
      } catch (error) {
        console.error(error);
      }

      this.rooms.delete(roomID);
      const removed = Room.Cache.remove(roomID);

      // Sometimes the room might have already been removed from the cache (e.g. when a room is fully deleted)
      if (removed > 0 && DEBUG_MESSAGES)
        console.log(`Room ${roomID} has been removed from the cache.`);
    }
  }

  private sendToClient(id: string, data: any): void {
    if (id === undefined || !this.connections.has(id)) {
      console.error("Error while sending data to client: invalid ID.");
      return;
    }

    let session = this.connections.get(id);
    session.socket.send(JSON.stringify(data));
  }

  private sendToRoom(senderID: string, includeSender: boolean, data: any) {
    const roomID = this.connections.get(senderID).roomID;

    this.rooms.get(roomID).forEach((clientID: string) => {
      let session = this.connections.get(clientID);

      if ((includeSender && clientID === senderID) || clientID !== senderID) {
        session.socket.send(JSON.stringify(data));
      }
    });
  }

  private sendError(id: string, errorAction: string, errorMessage: string) {
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

    this.sendToClient(id, response);
  }

  private addEventListener(event: string, listener: (args: EventMessage) => void): void {
    this.events.addListener(event, async (args: EventMessage) => {
      const { session } = args;
      try {
        /* 
          If a room event is received when the room is not in the cache, close the connection
  
          This handles the case where the room has been removed from the cache (e.g. when the cache has reached its memory limit), 
          but the socket connection is still open. If we didn't do this, things would still work but the frontend's data 
          may be out of sync (without the user realizing). Better to close the connection and force a refresh
        */
        const exists = await Room.Cache.exists(session.roomID);
        if (!exists) {
          await this.removeClient(session.id);
          session.socket.terminate();
          session.active = false;
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

        this.sendError(session.id, event, err.message);
      }
    });
  }

  async addItem({ socket, roomID, data, sendResponse }: EventMessage) {
    if (data === undefined) throw new StatusError("Item data is undefined", 400);

    const item = await Room.Cache.addItem(roomID, data);

    this.sendToRoom(socket.id, sendResponse, {
      event: "itemAdded",
      data: item,
    });
  }

  async updateItems({ socket, roomID, data, sendResponse }: EventMessage) {
    if (data?.items === undefined) throw new StatusError("Array 'items' is undefined", 400);

    await Room.Cache.updateItems(roomID, data.items);

    this.sendToRoom(socket.id, sendResponse, {
      event: "itemsUpdated",
      data,
    });
  }

  async deleteItem({ socket, roomID, data, sendResponse }: EventMessage) {
    if (data?.id === undefined) throw new StatusError("Item ID is undefined", 400);

    try {
      await Room.Cache.removeItem(roomID, data.id);
    } catch (error) {
      this.sendError(socket.id, "deleteItem", error.message);
      return;
    }

    this.sendToRoom(socket.id, sendResponse, {
      event: "itemDeleted",
      data,
    });
  }

  async updateLayout({ socket, roomID, data, sendResponse }: EventMessage) {
    if (data?.vertices === undefined || data.vertices.length === 0)
      throw new StatusError("'vertices' array is empty or undefined", 400);

    await Room.Cache.updateVertices(roomID, data.vertices);

    this.sendToRoom(socket.id, sendResponse, {
      event: "layoutUpdated",
      data,
    });
  }

  async cloneRoom({ socket, roomID, data, sendResponse }: EventMessage) {
    if (data?.templateId === undefined) throw new StatusError("'templateId' is undefined", 400);

    const templateId = data.templateId;

    await Room.Cache.copyFrom(roomID, templateId);

    this.sendToRoom(socket.id, sendResponse, {
      event: "roomCloned",
      data,
    });
  }

  async updateRoomName({ socket, roomID, data, sendResponse }: EventMessage) {
    if (data === undefined || data.name === undefined || data.name.length <= 0)
      throw new StatusError("'name' string is empty or undefined", 400);

    let name = data.name.trim().substring(0, Math.min(Room.MAX_NAME_LENGTH, data.name.length));
    await Room.Cache.updateData(roomID, { name: name });

    this.sendToRoom(socket.id, sendResponse, {
      event: "roomNameUpdated",
      data,
    });
  }

  async deleteRoom({ socket, roomID, sendResponse }: EventMessage) {
    Room.delete(roomID);

    this.sendToRoom(socket.id, sendResponse, {
      event: "roomDeleted",
      data: {},
    });
  }

  /*
    Add a nickname (also referred to as usernames) to the room, or updates a name if it already exists at a given socket ID. Sends to 
    every client the array of users
  */
  async updateNickname({ session, roomID, data, sendResponse }: EventMessage) {
    if (data === undefined || data.userName === undefined || data.userName.length <= 0)
      throw new StatusError("'userName' string is empty or undefined", 400);    

    console.log(roomID, JSON.stringify(data), sendResponse)

    // Update socket's username
    session.userName = data.userName
      .trim()
      .substring(0, Math.min(Room.MAX_USERNAME_LENGTH, data.userName.length));

    // Get all usernames in the room
    const users = this.getRoomUsernames(roomID);

    console.log(users)

    this.sendToRoom(session.id, sendResponse, {
      event: "nicknamesUpdated",
      data: { users },
    });
  }

  async onPing() {
    this.connections.forEach(async (session: UserSession) => {
      /*
        If inactive:
        - remove the client from the current roomID
        - terminate the socket connection
      */
      if (!session.active) {
        if (DEBUG_MESSAGES) 
          console.log("Connection " + session.id + " inactive. Closing it.");
          
        await this.removeClient(session.id);
        session.socket.terminate();
      }

      session.active = false;
      session.socket.ping(() => {});
    });

    if (!USE_DEBUGGER) return;

    if (this.rooms.size > 0) {
      console.log(chalk.bgGray("============== Rooms  =============="));

      this.rooms.forEach((_, roomID) => {
        console.log(chalk.blue(roomID));
      });
    }
  }

  public getRoomUsernames(roomID: string): Array<string> {
    return [...this.rooms.get(roomID)].map((socketId) => {
      return this.connections.get(socketId).userName;
    });
  }
}

/*
  If room does not exist, create it and add the client. If it does,
  just add the client to the existing room.
*/

/*
  Remove client, and if it is the last client in a room,
  delete the room from the cache too.
*/

/**
 * Send a socket message to a client by ID
 * @param { string } id
 * @param { object } data
 * @returns none
 */

/**
 * Send a socket message to an entire room, similar to broadcast. The message will be sent to whatever room
 * the given `senderID` belongs to
 * @param { string } senderID Client ID of sender.
 * @param { boolean } includeSender If true, will also send message to sender
 * @param { object } data
 * @returns none
 */

/**
 * Sends an error message to a client by ID
 * @param { string } id
 * @param { string } errorAction
 * @param { string } errorMessage
 */

/*
  Called every PONG_TIME milliseconds. This is to check if
  every socket is still alive. If not, then remove the client.
*/

/*
  Called when socket is initially connected. Used for setting
  up the socket events.
*/

/**
 * Custom function for adding an event listener to the hub. Wraps the listener in a function that catches and handles errors.
 * Any errors caught at this stage without a 'status' property will be interpreted as internal server errors
 */

/**
 * Setup the socket hub, which directs incoming socket messages to the correct callback
 * @param {*} sockets WebSocket instance
 */

export { Hub };
