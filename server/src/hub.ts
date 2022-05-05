import { EventEmitter } from "stream";
import { StatusError } from "./errors/status.error";
import chalk from "chalk";
import { v4 as uuidv4 } from "uuid";
import ws from "ws";
import { RoomCacheService, RoomService } from "./services/room.service";
import { MAX_NAME_LENGTH, MAX_USERNAME_LENGTH } from "./constants/room.constants";
import { IncomingMessage } from "http";
import { DEBUG_MESSAGES, USE_DEBUGGER, PONG_TIME } from "./constants/hub.constants";

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

    console.log("Initializing socket hub...");

    /**
      Setup event callback for socket events. Note how they're encapsulated within a lambda function;
      this allows the callback to access the rest of the class (otherwise, `this` will be incorrect!)
    */
    this.addEventListener("addItem", async (args: EventMessage) => this.addItem(args));
    this.addEventListener("updateItems", async (args: EventMessage) => this.updateItems(args));
    this.addEventListener("deleteItem", async (args: EventMessage) => this.deleteItem(args));
    this.addEventListener("updateLayout", async (args: EventMessage) => this.updateLayout(args));
    this.addEventListener("cloneRoom", async (args: EventMessage) => this.cloneRoom(args));
    this.addEventListener("deleteRoom", async (args: EventMessage) => this.deleteRoom(args));
    this.addEventListener("updateRoomName", async (args: EventMessage) =>
      this.updateRoomName(args)
    );
    this.addEventListener("updateNickname", async (args: EventMessage) =>
      this.updateNickname(args)
    );

    this.sockets = sockets;
    this.sockets.on("connection", async (socket, request) => this.onConnection(socket, request));

    setInterval(async () => this.onPing(), PONG_TIME);
  }

  /**
   * Called when a socket is initially connected. User for setting up the socket events.
   * @param socket Socket connection.
   * @param req
   * @private
   */
  private async onConnection(socket: ws.WebSocket, req: IncomingMessage) {
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

  /**
   * Adds a client to a given room from a user session.
   * @param session User session.
   * @private
   */
  private async addClient(session: UserSession) {
    this.connections.set(session.id, session);

    if (!this.rooms.has(session.roomID)) {
      this.rooms.set(session.roomID, new Set<string>());
    }

    const inCache = await RoomCacheService.roomExists(session.roomID);
    if (!inCache) {
      await RoomCacheService.addRoom(session.roomID);
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

  /**
   * From a given ID, remove a client from the hub.
   * @param clientID Client ID.
   * @private
   */
  private async removeClient(clientID: string) {
    if (!this.connections.has(clientID)) return;

    const roomID = this.connections.get(clientID).roomID;
    if (roomID === undefined || !this.rooms.has(roomID)) {
      console.error("Error while removing client: RoomID stored under client is invalid");
      return;
    }

    this.rooms.get(roomID).delete(clientID);

    // It's important that the nicknames update is sent BEFORE the clientID is deleted from the connections map.
    // Otherwise, the message would fail to send since this client ID is no longer valid
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
        await RoomCacheService.save(roomID);
      } catch (error) {
        console.error(error);
      }

      this.rooms.delete(roomID);
      const removed = await RoomCacheService.removeRoom(roomID);

      // Sometimes the room might have already been removed from the cache (e.g. when a room is fully deleted)
      if (removed && DEBUG_MESSAGES) console.log(`Room ${roomID} has been removed from the cache.`);
    }
  }

  /**
   * Send a socket message to a client by ID
   * @param { string } id
   * @param { object } data
   * @returns none
   */
  private sendToClient(id: string, data: any) {
    if (id === undefined || !this.connections.has(id)) {
      console.error("Error while sending data to client: invalid ID.");
      return;
    }

    let session = this.connections.get(id);
    session.socket.send(JSON.stringify(data));
  }

  /**
   * Send a message to a specific room.
   * @param senderID Client sending the message.
   * @param includeSender Determines if the message should be sent *back* to the sender.
   * @param data Payload.
   * @private
   */
  private sendToRoom(senderID: string, includeSender: boolean, data: any) {
    const roomID = this.connections.get(senderID).roomID;

    this.rooms.get(roomID).forEach((clientID: string) => {
      let session = this.connections.get(clientID);

      if ((includeSender && clientID === senderID) || clientID !== senderID) {
        session.socket.send(JSON.stringify(data));
      }
    });
  }

  /**
   * Sends an error to a client.
   * @param id User ID.
   * @param errorAction Error Action.
   * @param errorMessage Error Message.
   * @private
   */
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

  /**
   * Adds an event listener callback, i.e. set a callback to run given an event.
   * @param event
   * @param listener
   * @private
   */
  private addEventListener(event: string, listener: (args: EventMessage) => void) {
    this.events.addListener(event, async (args: EventMessage) => {
      const { session } = args;
      try {
        /* 
          If a room event is received when the room is not in the cache, close the connection
  
          This handles the case where the room has been removed from the cache (e.g. when the cache has reached its memory limit), 
          but the socket connection is still open. If we didn't do this, things would still work but the frontend's data
          may be out of sync (without the user realizing). Better to close the connection and force a refresh
        */
        const exists = await RoomCacheService.roomExists(session.roomID);
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

  /**
   * Check each connected session to see if a connection can still be established.
   * If not, then kill the connection and remove the client.
   * @private
   */
  private async onPing() {
    // instead of running sequentially, ping each client in parallel.
    await Promise.all(
      Array.from(this.connections.values()).map(async (session) => {
        /*
                If inactive:
                - remove the client from the current roomID
                - terminate the socket connection
              */
        if (!session.active) {
          if (DEBUG_MESSAGES) console.log("Connection " + session.id + " inactive. Closing it.");

          await this.removeClient(session.id);
          session.socket.terminate();
        }

        session.active = false;
        session.socket.ping(() => {});
      })
    );

    if (!USE_DEBUGGER) return;

    if (this.rooms.size > 0) {
      console.log(chalk.bgGray("============== Rooms  =============="));

      this.rooms.forEach((_, roomID) => {
        console.log(chalk.blue(roomID));
      });
    }
  }

  /**
   * Get usernames from a given room.
   * @param roomID
   * @private
   */
  private getRoomUsernames(roomID: string): Array<string> {
    return [...this.rooms.get(roomID)].map((socketId) => {
      return this.connections.get(socketId).userName;
    });
  }

  /**
   * Adds an item to a room.
   * @private
   */
  private async addItem({ session, roomID, data, sendResponse }: EventMessage) {
    if (data === undefined) throw new StatusError("Item data is undefined", 400);

    const item = await RoomCacheService.addItem(roomID, data);

    this.sendToRoom(session.id, sendResponse, {
      event: "itemAdded",
      data: item,
    });
  }

  /**
   * Update multiple items in a room.
   * @private
   */
  private async updateItems({ session, roomID, data, sendResponse }: EventMessage) {
    if (data?.items === undefined) throw new StatusError("Array 'items' is undefined", 400);

    await RoomCacheService.updateItems(roomID, data.items);

    this.sendToRoom(session.id, sendResponse, {
      event: "itemsUpdated",
      data,
    });
  }

  /**
   * Delete an item in a room.
   * @private
   */
  private async deleteItem({ session, roomID, data, sendResponse }: EventMessage) {
    if (data?.id === undefined) throw new StatusError("Item ID is undefined", 400);

    try {
      await RoomCacheService.removeItem(roomID, data.id);
    } catch (error) {
      this.sendError(session.id, "deleteItem", error.message);
      return;
    }

    this.sendToRoom(session.id, sendResponse, {
      event: "itemDeleted",
      data,
    });
  }

  /**
   * Updates the layout of a given room.
   * @private
   */
  private async updateLayout({ session, roomID, data, sendResponse }: EventMessage) {
    if (data?.vertices === undefined || data.vertices.length === 0)
      throw new StatusError("'vertices' array is empty or undefined", 400);

    await RoomCacheService.updateRoomVertices(roomID, data.vertices);

    this.sendToRoom(session.id, sendResponse, {
      event: "layoutUpdated",
      data,
    });
  }

  /**
   * Clones a room from a given template.
   * @private
   */
  private async cloneRoom({ session, roomID, data, sendResponse }: EventMessage) {
    if (data?.templateId === undefined) throw new StatusError("'templateId' is undefined", 400);

    const templateId = data.templateId;

    await RoomCacheService.copyRoomFrom(roomID, templateId);

    this.sendToRoom(session.id, sendResponse, {
      event: "roomCloned",
      data,
    });
  }

  /**
   * Updates the name of a room.
   * @private
   */
  private async updateRoomName({ session, roomID, data, sendResponse }: EventMessage) {
    if (data === undefined || data.name === undefined || data.name.length <= 0)
      throw new StatusError("'name' string is empty or undefined", 400);

    let name = data.name.trim().substring(0, Math.min(MAX_NAME_LENGTH, data.name.length));
    await RoomCacheService.updateRoomData(roomID, { name: name });

    this.sendToRoom(session.id, sendResponse, {
      event: "roomNameUpdated",
      data,
    });
  }

  /**
   * Deletes a room.
   * @private
   */
  private async deleteRoom({ session, roomID, sendResponse }: EventMessage) {
    await RoomService.deleteRoom(roomID);

    this.sendToRoom(session.id, sendResponse, {
      event: "roomDeleted",
      data: {},
    });
  }

  /*
    Add a nickname (also referred to as usernames) to the room, or updates a name if it already exists at a given socket ID. Sends to 
    every client the array of users
    @private
  */
  private async updateNickname({ session, roomID, data, sendResponse }: EventMessage) {
    if (data === undefined || data.userName === undefined || data.userName.length <= 0)
      throw new StatusError("'userName' string is empty or undefined", 400);

    console.log(roomID, JSON.stringify(data), sendResponse);

    // Update socket's username
    session.userName = data.userName
      .trim()
      .substring(0, Math.min(MAX_USERNAME_LENGTH, data.userName.length));

    // Get all usernames in the room
    const users = this.getRoomUsernames(roomID);

    this.sendToRoom(session.id, sendResponse, {
      event: "nicknamesUpdated",
      data: { users },
    });
  }
}

export { Hub };
