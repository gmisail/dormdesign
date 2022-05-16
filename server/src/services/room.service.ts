import { Cache } from "../cache";
import { Database } from "../db";
import {
  documentToRoom,
  Room,
  RoomData,
  RoomDocument,
  roomToDocument,
  RoomUpdate,
  UpdateRoomDataSchema,
} from "../models/room.model";
import { StatusError } from "../errors/status.error";
import { Item } from "../models/item.model";
import { ItemService } from "./item.service";
import { v4 as uuidv4 } from "uuid";
import { validateWithSchema } from "../utils";
import { Position } from "../models/position.model";

const DEBUG_MESSAGES = Boolean(process.env.DEBUG_MESSAGES ?? "false");

class RoomService {
  /**
   * Create a new room with a given name
   * @param { string } name
   * @param { string | undefined } templateId If specified, copies the data from this template
   * @returns { Promise.<Room> } The newly created room object
   * @throws When the creation fails
   */
  static async createRoom(name: string, templateId: string = undefined): Promise<Room> {
    const id = uuidv4();
    const newTemplateId = uuidv4();

    /* initial room structure, 10 ft x 10 ft room */
    const room: Room = {
      id,
      templateId: newTemplateId,
      data: {
        name: name ?? "New Room",
        items: [],
        vertices: [
          { x: -5, y: -5 },
          { x: 5, y: -5 },
          { x: 5, y: 5 },
          { x: -5, y: 5 },
        ],
      },
      metaData: {
        featured: false,
        lastModified: Date.now(),
      },
    };

    /* if a template ID is provided, then we are cloning a room */
    if (templateId !== undefined) {
      const templateRoom: Room = await RoomService.getFromTemplateId(templateId);

      room.data = { ...templateRoom.data };

      // If a name has been provided, use that. Otherwise, append 'Copy of ' to front of template name
      if (name !== null && name !== undefined) {
        room.data.name = name;
      } else {
        room.data.name = `Copy of ${room.data.name}`;
      }
    }

    try {
      await Database.getConnection()
        .db("dd_data")
        .collection("rooms")
        .insertOne(roomToDocument(room));
    } catch (err) {
      throw new Error("Failed to create room: " + err);
    }

    if (DEBUG_MESSAGES) console.log(`Room ${id} has been created.`);

    return room;
  }

  /**
   * Deletes the room with the given id from both the database and cache
   * @param { string } id
   * @throws When delete fails
   */
  static async deleteRoom(id: string) {
    try {
      await Database.getConnection().db("dd_data").collection("rooms").deleteOne({ _id: id });

      if (DEBUG_MESSAGES) console.log(`Room ${id} has been deleted from the database`);
    } catch (err) {
      throw new Error(`Failed to delete room ${id} ` + err);
    }

    await Cache.getClient().del(id);

    if (DEBUG_MESSAGES) console.log(`Room ${id} has been removed from the cache.`);
  }

  /**
   * Get the JSON data from a room at an ID. Returns the cached version if it exists, the version in the
   * database otherwise.
   * @param { string } id
   * @param { string } idKey The key used in the MongoDB query filter. Defaults to "_id"
   * @returns { Promise.<Room> } The room object if it exists
   * @throws When the function fails to get the room
   */
  static async getRoom(id: string, idKey: string = "_id"): Promise<Room> {
    /* First check if room is in the cache, which we can only do here if the room is being fetched using its id.
      Otherwise, we will do this check after we've queried the database and have the room ID */
    if (idKey === "_id") {
      let cachedRoom = await Cache.getClient().get(id);

      if (cachedRoom !== null) {
        // Commented this debug message since it gets spammed a lot. But it's sometimes useful
        // if (DEBUG_MESSAGES) console.log(`Get on cachedRoom ${id} used cached data.`);
        return JSON.parse(cachedRoom);
      }
    }

    let filter = {};
    filter[idKey] = id;

    /* Since it is not cached, retrieve it from the database */
    let roomDocument: RoomDocument;
    try {
      roomDocument = (await Database.getConnection()
        .db("dd_data")
        .collection("rooms")
        .findOne(filter)) as RoomDocument;
    } catch (err) {
      throw new Error(`Failed to get room with id '${id}'.` + err);
    }

    if (roomDocument === null) throw new StatusError(`Room with id '${id}' not found`, 404);

    const room = documentToRoom(roomDocument);

    /* In the case where the room has been fetched using something other than the room id, we can now check the cache
      for the most up-to-date version (since we now know the room ID) */
    if (idKey !== "_id") {
      let cachedRoom = await Cache.getClient().get(room.id);
      if (cachedRoom !== null) {
        // Commented this debug message since it gets spammed a lot. But it's sometimes useful
        if (DEBUG_MESSAGES)
          console.log(`Get on room ${JSON.parse(cachedRoom).id} used cached data.`);

        return JSON.parse(cachedRoom);
      }
    }

    return room;
  }

  /**
   * Get the JSON data from a room with given templateId. If the room is currently
   * in the cache, that data will be returned. Otherwise, the data stored in the
   * database will be returned.
   * @param { string } templateId
   * @returns { Promise.<Room> } The room object if it exists
   * @throws When the function fails to get the room
   */
  static async getFromTemplateId(templateId: string): Promise<Room> {
    return RoomService.getRoom(templateId, "templateId");
  }

  /**
   * Get the template version of a room at the given `templateId`. If the room is currently
   * in the cache, that data will be returned. Otherwise, the data stored in the
   * database will be returned.
   * @param { string } templateId
   * @returns { Promise.<Partial<Room>> } Template object (same as Room object but 'id' field is removed)
   * @throws When the function fails to get the room
   */
  static async getTemplate(templateId: string): Promise<Partial<Room>> {
    const room: Room = await RoomService.getFromTemplateId(templateId);
    delete room["id"];

    return room;
  }

  /**
   * Returns rooms with 'featured' set to true. Returned rooms have their 'id' fields removed
   * and only include basic data (e.g. name).
   * @returns { Promise.<Array<Partial<Room>>> }
   */
  static async getFeaturedRooms(): Promise<Array<Partial<Room>>> {
    let roomDocuments: Array<RoomDocument>;

    try {
      const cursor = await Database.getConnection()
        .db("dd_data")
        .collection("rooms")
        .find({ "metaData.featured": true });
      roomDocuments = (await cursor.toArray()) as RoomDocument[];
    } catch (error) {
      throw new Error(`Failed to get featured rooms.` + error);
    }

    // Don't include room ID or any other unnecessary data in returned objects
    return roomDocuments.map((room) => {
      let updatedRoom: any = { ...room };
      updatedRoom["name"] = room.data.name;

      delete updatedRoom["_id"];
      delete updatedRoom.data;

      return updatedRoom;
    });
  }
}

/**
 * Stores functions used by socket Hub to edit room. Most of these functions do not actually
 * modify the room in the database, only the active version in the cache.
 *
 * A room should only be able to be edited through live connections, so these functions should
 * probably only be used by the Hub.
 */
class RoomCacheService {
  /**
   * Check if a room is currently in the cache
   * @param { string } id
   * @returns { Promise.<boolean> } `true` if it is, `false` otherwise
   */
  static async roomExists(id: string): Promise<boolean> {
    // Returns the number of matches found (in this case either 1 or 0)
    const res = await Cache.getClient().exists(id);

    return res === 1;
  }

  /**
   * Adds a copy of a room from the database to the cache
   * @param { string } id
   * @throws If the room under `id` already exists in the cache or if fetching the room from the DB fails.
   */
  static async addRoom(id: string) {
    const exists = await Cache.getClient().exists(id);

    if (exists) throw new Error("Room with given id already exists in the cache");

    const room = await RoomService.getRoom(id);
    const res = await Cache.getClient().set(id, JSON.stringify(room));

    if (res === "OK" && DEBUG_MESSAGES) console.log(`Added room ${id} to the cache.`);
  }

  /**
   * Removes room from the cache
   * @param {string} id ID of room
   * @returns true if the cache successfully removed the key, false if no key was removed
   */
  static async removeRoom(id: string): Promise<boolean> {
    // del is the number of keys the cache removed
    const del = await Cache.getClient().del(id);
    return del > 0;
  }

  /**
   * Copy data from room at `templateId` into room at `id`
   * @param { string } id
   * @param { string } templateId
   * @throws If either room at `id` or the room at `templateId` fail to be fetched
   */
  static async copyRoomFrom(id: string, templateId: string): Promise<Room> {
    const room = await RoomService.getRoom(id);
    const templateRoom = await RoomService.getFromTemplateId(templateId);

    room.data = templateRoom.data;
    room.metaData.lastModified = Date.now();

    /*
      TODO: increment the number of clones
    */

    await Cache.getClient().set(id, JSON.stringify(room));

    return room;
  }

  /**
   * Updates fields within the 'data' property of a room with the given `id` from the corresponding fields in `update`. If any of the fields in the update
   * don't exist in the room data, the entire update fails.
   * @param { string } id The ID of the room to update
   * @param { Partial<RoomUpdate> } updates
   * @throws When `update` contains a field that can't be updated in the room
   */
  static async updateRoomData(id: string, updates: Partial<RoomUpdate>) {
    const room = await RoomService.getRoom(id);

    validateWithSchema(updates, UpdateRoomDataSchema);
    Object.assign(room.data, updates);

    room.metaData.lastModified = Date.now();

    await Cache.getClient().set(id, JSON.stringify(room));
  }

  /**
   * Update the vertices of a given room
   * @param { string } id
   * @param { array[Position] } vertices
   * @throws An error if the update fails
   */
  static async updateRoomVertices(id: string, vertices: Array<Position>) {
    await RoomCacheService.updateRoomData(id, { vertices });
  }

  /**
   * Update the name of a given room
   * @param { string } id
   * @param { string } name
   * @throws An error if the update fails
   */
  static async updateRoomName(id: string, name: string) {
    await RoomCacheService.updateRoomData(id, { name });
  }

  /**
   * Add an item (generated by the Item model schema) to a given room
   * @param { string } id
   * @param { JSON } item
   * @returns { Promise.<object> } the new item
   * @throws When creating the item or adding it to the room fails
   */
  static async addItem(id: string, item: Item) {
    const newItem = ItemService.createItem(item);
    const room = await RoomService.getRoom(id);

    let items = room.data.items;
    items.push(newItem);

    room.metaData.lastModified = Date.now();
    await Cache.getClient().set(id, JSON.stringify(room));

    return newItem;
  }

  /**
   * Clear the items of a given room
   * @param { string } id
   * @throws When there's an error getting the room with `id` (e.g. the room doesn't exist)
   */
  static async clearItems(id: string) {
    const room = await RoomService.getRoom(id);

    room.data.items = [];
    room.metaData.lastModified = Date.now();

    await Cache.getClient().set(id, JSON.stringify(room));
  }

  /**
   * Remove item from a room
   * @param { string } id
   * @param { string } itemId
   * @throws When there's an error getting the room with `id` (e.g. the room doesn't exist)
   */
  static async removeItem(id: string, itemId: string) {
    const room = await RoomService.getRoom(id);

    room.data.items = room.data.items.filter((item) => item.id !== itemId);
    room.metaData.lastModified = Date.now();

    await Cache.getClient().set(id, JSON.stringify(room));
  }

  /**
   * Edit the properties multiple items in a room. If any of the updates fail, none of the updates are applied
   * @param { string } id
   * @param { object } updates Object containing updates to items. Should be of the form
   * `[{ id, update }]`
   * @throws When there's an error getting the room or one of the updates fails
   */
  static async updateItems(id: string, updates: Array<{ id: string; updated: Partial<Item> }>) {
    let room = await RoomService.getRoom(id);

    let updateMapping = {};

    for (let itemUpdate of updates) {
      updateMapping[itemUpdate.id] = itemUpdate.updated;
    }

    for (let i = 0; i < room.data.items.length; i++) {
      let item = room.data.items[i];

      const update = updateMapping[item.id];
      if (update !== undefined) {
        ItemService.updateItem(item, update);
      }
    }

    room.metaData.lastModified = Date.now();

    await Cache.getClient().set(id, JSON.stringify(room));
  }

  /** Updates the database with the content that is currently in the cache.
   * @param { string } id
   * @returns { Promise.<boolean> } `false` if the room isn't in the cache and `true` if the save succeeds
   * @throws When there's an error updating the room in the cache to the room in the database
   */
  static async save(id: string): Promise<boolean> {
    let serializedRoom = await Cache.getClient().get(id);

    if (serializedRoom == null) {
      // This could occur if the room was just fully deleted
      if (DEBUG_MESSAGES)
        console.log(
          `Cannot push room ${id} from cache to database. The room doesn't exist in the cache`
        );
      return false;
    }

    const room: Room = JSON.parse(serializedRoom) as Room;

    try {
      await Database.getConnection()
        .db("dd_data")
        .collection("rooms")
        .replaceOne({ _id: id }, roomToDocument(room));
    } catch (err) {
      throw new Error(`Failed to save room ${id} from cache to db: ` + err);
    }

    if (DEBUG_MESSAGES) console.log("Room " + id + " pushed from cache to database.");

    return true;
  }
}

export { RoomService, RoomCacheService };
