import { Cache } from "../cache";
// const rethinkdb = require("rethinkdb");
import { Database } from "../db";
import Joi from "joi";

const { v4: uuidv4 } = require("uuid");

const Item = require("./item.model");

const { updateRoomDataSchema } = require("../schemas/room.schema");

const { validateWithSchema } = require("../utils.js");

const DEBUG_MESSAGES = Boolean(process.env.DEBUG_MESSAGES ?? "false");

let Room = {};
Room.MAX_NAME_LENGTH = 40;
Room.MAX_USERNAME_LENGTH = 30;

/**
 * Create a new room with a given name
 * @param { string } name
 * @param { string | undefined } templateId If specified, copys the data from this template
 * @returns { Promise.<object> } The newly created room object
 * @throws When the creation fails
 */
Room.create = async function (name, templateId) {
  let vertices = [
    { x: -5, y: -5 },
    { x: 5, y: -5 },
    { x: 5, y: 5 },
    { x: -5, y: 5 },
  ];

  const id = uuidv4();
  const newTemplateId = uuidv4();

  const room = {
    _id: id,
    templateId: newTemplateId,
    data: {
      name: name ?? "New Room",
      items: [],
      vertices,
    },
    metaData: {
      featured: false,
      lastModified: Date.now(),
    },
  };

  if (templateId !== undefined) {
    const templateRoom = await Room.getFromTemplateId(templateId);

    room.data = { ...templateRoom.data };
    // If a name has been provided, use that. Otherwise append 'Copy of ' to front of template name
    if (name !== null && name !== undefined) {
      room.data.name = name;
    } else {
      room.data.name = "Copy of " + room.data.name;
    }
  }

  try {
    await Database.getConnection().db("dd_data").collection("rooms").insertOne(room);
  } catch (err) {
    throw new Error("Failed to create room: " + err);
  }

  if (DEBUG_MESSAGES) console.log(`Room ${id} has been created.`);

  room.id = room._id;
  delete room["_id"];

  return room;
};

/**
 * Deletes the room with the given id from both the database and cache
 * @param { string } id
 * @returns { Promise.<object> }
 * @throws When the delete fails
 */
Room.delete = async function (id) {
  try {
    await Database.getConnection().db("dd_data").collection("rooms").deleteOne({ _id: id });
    if (DEBUG_MESSAGES) console.log(`Room ${id} has been deleted from the database`);
  } catch (err) {
    throw new Error(`Failed to delete room ${id} ` + err);
  }

  await Cache.getClient().del(id);

  if (DEBUG_MESSAGES) console.log(`Room ${id} has been removed from the cache.`);
};

/**
 * Get the JSON data from a room at an ID. Returns the cached version if it exists, the version in the
 * database otherwise.
 * @param { string } id
 * @param { string } idKey The key used in the MongoDB query filter. Defaults to "_id"
 * @returns { Promise.<object> } The room object if it exists
 * @throws When the function fails to get the room
 */
Room.get = async function (id, idKey = "_id") {
  /* First check if room is in the cache, which we can only do here if the room is being fetched using its id. Otherwise
  we will do this check after we've queried the database and have the room ID */
  if (idKey === "_id") {
    let cachedRoom = await Cache.getClient().get(id);
    if (cachedRoom !== null) {
      // Commented this deubg message since it gets spammed a lot. But it's sometimes useful
      // if (DEBUG_MESSAGES) console.log(`Get on cachedRoom ${id} used cached data.`);
      return JSON.parse(cachedRoom);
    }
  }

  let filter = {};
  filter[idKey] = id;

  /* Since it is not cached, retrieve it from the database */
  let room;
  try {
    room = await Database.getConnection().db("dd_data").collection("rooms").findOne(filter);
  } catch (err) {
    throw new Error(`Failed to get room with id '${id}'.` + err);
  }

  if (room === null) {
    const err = new Error(`Room with id '${id}' not found`);
    err.status = 404;
    throw err;
  }

  room.id = room._id;
  delete room["_id"];

  /* In the case where the room has been fetched using something other than the room id, we can now check the cache
  for the most up to date version (since we now know the room ID) */
  if (idKey !== "_id") {
    let cachedRoom = await Cache.getClient().get(room.id);
    if (cachedRoom !== null) {
      // Commented this deubg message since it gets spammed a lot. But it's sometimes useful
      // if (DEBUG_MESSAGES) console.log(`Get on room ${cachedRoom.id} used cached data.`);
      return JSON.parse(cachedRoom);
    }
  }

  return room;
};

/**
 * Get the JSON data from a room with given templateId. If the room is currently
 * in the cache, that data will be returned. Otherwise, the data stored in the
 * database will be returned.
 * @param { string } templateId
 * @returns { Promise.<object> } The room object if it exists
 * @throws When the function fails to get the room
 */
Room.getFromTemplateId = async function (templateId) {
  return Room.get(templateId, "templateId");
};

/**
 * Returns rooms with 'featured' set to true. Returned rooms have their 'id' fields removed
 * and only include basic data (e.g. name)
 * @returns { Promise.<object> }
 */
Room.getFeatured = async function () {
  let rooms;
  try {
    const cursor = await Database.getConnection()
      .db("dd_data")
      .collection("rooms")
      .find({ "metaData.featured": true });
    rooms = await cursor.toArray();
  } catch (error) {
    throw new Error(`Failed to get featured rooms.` + error);
  }

  // Don't include room ID or any other unnecessary data in returned objects
  for (let i = 0; i < rooms.length; i++) {
    rooms[i]["name"] = rooms[i].data.name;
    delete rooms[i]["_id"];
    delete rooms[i]["data"];
  }

  return rooms;
};

/**
 * Stores functions used by socket Hub to edit room. Most of these functions do not actually
 * modify the room in the database, only the active version in the cache.
 *
 * A room should only be able to be edited through live connections, so these functions should
 * probably only be used by the Hub.
 */
Room.Cache = {};

/**
 * Check if a room is currently in the cache
 * @param { string } id
 * @returns { Promise.<boolean> } `true` if it is, `false` otherwise
 */
Room.Cache.exists = async function (id) {
  // Returns the number of matches found (in this case either 1 or 0)
  const res = await Cache.getClient().exists(id);

  return res === 1;
};

/**
 * Adds a copy of a room from the database to the cache
 * @param { string } id
 * @returns { Promise.<void> }
 * @throws If the room under `id` already exists in the cache or if fetching the room from the DB fails.
 */
Room.Cache.add = async function (id) {
  const exists = await Cache.getClient().exists(id);
  if (exists) {
    throw new Error("Room with given id already exists in the cache");
  }
  const room = await Room.get(id);

  const res = await Cache.getClient().set(id, JSON.stringify(room));
  if (res === "OK" && DEBUG_MESSAGES) {
    console.log(`Added room ${id} to the cache.`);
  }
};

/**
 * Removes room from the cache
 * @param {*} id ID of room
 * @returns true if the cache successfully removed the key, false if no key was removed
 */
Room.Cache.remove = async function (id) {
  // del is the number of keys the cache removed
  const del = await Cache.getClient().del(id);
  return del > 0;
};

/**
 * Copy data from room at `templateId` into room at `id`
 * @param { string } id
 * @param { string } templateId
 * @returns { Promise.<object> }
 * @throws If either room at `id` or the room at `templateId` fail to be fetched
 */
Room.Cache.copyFrom = async function (id, templateId) {
  const room = await Room.get(id);
  const templateRoom = await Room.getFromTemplateId(templateId);

  room.data = templateRoom.data;

  room.metaData.lastModified = Date.now();
  await Cache.getClient().set(id, JSON.stringify(room));

  return room;
};

/**
 * Updates fields within the 'data' property of a room with the given `id` from the corresponding fields in `update`. If any of the fields in the update
 * don't exist in the room data, the entire update fails.
 * @param { string } id The ID of the room to update
 * @param { JSON } update The update
 * @returns { Promise.<void> }
 * @throws When `update` contains a field that can't be updated in the room
 */
Room.Cache.updateData = async function (id, update) {
  const room = await Room.get(id);
  validateWithSchema(update, updateRoomDataSchema);

  Object.assign(room.data, update);

  room.metaData.lastModified = Date.now();
  await Cache.getClient().set(id, JSON.stringify(room));
};

/**
 * Update the vertices of a given room
 * @param { string } id
 * @param { array[{ x: number, y: number }] } vertices
 * @returns { Promise.<void> }
 * @throws An error if the update fails
 */
Room.Cache.updateVertices = async function (id, vertices) {
  await Room.Cache.updateData(id, { vertices });
};

/**
 * Update the name of a given room
 * @param { string } id
 * @param { string } name
 * @returns { Promise.<void> }
 * @throws An error if the update fails
 */
Room.Cache.updateName = async function (id, name) {
  await Room.Cache.updateData(id, { name });
};

/**
 * Add an item (generated by the Item model schema) to a given room
 * @param { string } id
 * @param { JSON } item
 * @returns { Promise.<object> } the new item
 * @throws When creating the item or adding it to the room fails
 */
Room.Cache.addItem = async function (id, item) {
  const newItem = Item.create(item);
  const room = await Room.get(id);

  let items = room.data.items;
  items.push(newItem);

  room.metaData.lastModified = Date.now();
  await Cache.getClient().set(id, JSON.stringify(room));

  return newItem;
};

/**
 * Clear the items of a given room
 * @param { string } id
 * @returns { Promise.<void> }
 * @throws When there's an error getting the room with `id` (e.g. the room doesn't exist)
 */
Room.Cache.clearItems = async function (id) {
  const room = await Room.get(id);
  room.data.items = [];

  room.metaData.lastModified = Date.now();
  await Cache.getClient().set(id, JSON.stringify(room));
};

/**
 * Clear all of the items in a room
 * @param { string } id
 * @returns { Promise.<void> }
 * @throws When there's an error getting the room with `id` (e.g. the room doesn't exist)
 */
Room.Cache.removeItem = async function (id, itemId) {
  const room = await Room.get(id);

  room.data.items = room.data.items.filter((item) => item.id !== itemId);

  room.metaData.lastModified = Date.now();
  await Cache.getClient().set(id, JSON.stringify(room));
};

/**
 * Edit the properties multiple items in a room. If any of the updates fail, none of the updates are applied
 * @param { string } id
 * @param { object } updates Object containg updates to items. Should be of the form
 * `[{ id, update }]`
 * @returns { Promise.<void> }
 * @throws When there's an error getting the room or one of the updates fails
 */
Room.Cache.updateItems = async function (id, updates) {
  let room = await Room.get(id);

  let updateMap = {};
  for (let i = 0; i < updates.length; i++) {
    updateMap[updates[i].id] = updates[i].updated;
  }
  for (let i = 0; i < room.data.items.length; i++) {
    let item = room.data.items[i];
    const update = updateMap[item.id];
    if (update !== undefined) {
      Item.update(item, update);
    }
  }

  room.metaData.lastModified = Date.now();
  Cache.getClient().set(id, JSON.stringify(room));
};

/** Updates the database with the content that is currently in the cache.
 * @param { string } id
 * @returns { Promise.<boolean> } `false` if the room isn't in the cache and `true` if the save succeeds
 * @throws When there's an error updating the room in the cache to the room in the database
 */
Room.Cache.save = async function (id) {
  let room = await Cache.getClient().get(id);
  if (room !== null) {
    room = JSON.parse(room);
  } else {
    // This could occur if the room was just fully deleted
    if (DEBUG_MESSAGES)
      console.log(
        `Cannot push room ${id} from cache to database. The room doesn't exist in the cache`
      );
    return false;
  }

  // If the 'id' field is in the room, rename it to '_id'
  if ("id" in room) {
    room._id = id;
    delete room["id"];
  }

  try {
    await Database.getConnection().db("dd_data").collection("rooms").replaceOne({ _id: id }, room);
  } catch (err) {
    throw new Error(`Failed to save room ${id} from cache to db: ` + err);
  }

  if (DEBUG_MESSAGES) console.log("Room " + id + " pushed from cache to database.");

  return true;
};

module.exports = Room;
