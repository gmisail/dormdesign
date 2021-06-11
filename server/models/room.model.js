const rethinkdb = require("rethinkdb");
const database = require("../db");
const { v4: uuidv4 } = require("uuid");
const Template = require("./template.model");
const Cache = require("../cache");
const { client } = require("../cache");

let Room = {};
Room.MAX_NAME_LENGTH = 20;

/**
 * Create a new room with a given name
 * @param { string } name
 * @returns { Promise.<object> } room object if it exists, null otherwise
 */
Room.create = async function (name) {
  let vertices = [
    { x: -5, y: -5 },
    { x: 5, y: -5 },
    { x: 5, y: 5 },
    { x: -5, y: 5 },
  ];

  const id = uuidv4();
  const templateId = await Template.create(id);

  const room = {
    id,
    name,
    items: [],
    templateId,
    vertices,
  };

  const res = await rethinkdb
    .db("dd_data")
    .table("rooms")
    .insert(room)
    .run(database.connection);

  if (res === null) {
    console.error("Could not insert room.");
    return null;
  }

  return room;
};

Room.delete = async function (id) {
  const res = await rethinkdb
    .db("dd_data")
    .table("rooms")
    .get(id)
    .delete()
    .run(database.connection);

  if (res === null) {
    console.error("Could not delete room.");
    return null;
  }
};

/**
 * Get the JSON data from a room at an ID
 * @param { string } id
 * @returns { Promise.<object> } room object if it exists, null otherwise
 */
Room.get = async function (id) {
  let room = await client.get(id);

  if (room !== null) {
    console.log("Returning cached room at " + id);

    return JSON.parse(room);
  }

  room = await rethinkdb
    .db("dd_data")
    .table("rooms")
    .get(id)
    .run(database.connection);

  client
    .set(id, JSON.stringify(room))
    .then(() => console.log(id + " has been cached."));

  if (room === null) {
    console.error("Could not get room with id " + id);
    return null;
  }

  return room;
};

/**
 * Copy data from templateId into room with ID id
 * @param { string } id
 * @param { string } templateId
 * @returns { Promise.<object> } null if there is an error, returns new data otherwise
 */
Room.copyFrom = async function (id, templateId) {
  const room = await Room.get(id);
  const template = await Template.get(templateId);
  const templateData = await Room.get(template.targetId);

  templateData.id = room.id;
  templateData.templateId = room.templateId;
  templateData.name = room.name;

  try {
    await Room.updateProperty(id, templateData);
  } catch (error) {
    console.error("Could not copy room " + templateId + " to " + id);
    throw error;
  }

  return templateData;
};

/**
 * Updates the given property in a room.
 * @param { string } id
 * @param { JSON } data
 * @returns { Promise.<boolean> } true if there is an error, false otherwise
 */
Room.updateProperty = async function (id, data) {
  /*let res = await rethinkdb
    .db("dd_data")
    .table("rooms")
    .get(id)
    .update(data)
    .run(database.connection);

  
  if (res.skipped !== 0) {
    const err =
      "Could not update property: " + JSON.stringify(data) + ", at ID " + id;

    console.error(err);
    throw new Error(err);
  }
*/

  let room = Room.get(id);
  room = Object.assign(data, room);

  await Cache.client.set(id, JSON.stringify(room));

  return false;
};

/**
 * Update the vertices of a given room
 * @param { string } id
 * @param { array[{ x: number, y: number }] } vertices
 * @returns { Promise.<boolean> } true if there is an error, false otherwise
 */
Room.updateVertices = async function (id, vertices) {
  try {
    let res = await Room.updateProperty(id, { vertices: vertices });

    return res;
  } catch (error) {
    throw error;
  }
};

/**
 * Update the name of a given room
 * @param { string } id
 * @param { string } name
 * @returns { Promise.<boolean> } true if there is an error, false otherwise
 */
Room.updateRoomName = async function (id, name) {
  try {
    let res = await Room.updateProperty(id, { name: name });

    return res;
  } catch (error) {
    throw error;
  }
};

/**
 * Add an item (generated by the Item model schema) to a given room
 * @param { string } id
 * @param { JSON } item
 * @returns { Promise.<object> } null if there is an error, otherwise returns the new Item
 */
Room.addItem = async function (id, item) {
  const itemId = uuidv4();
  /*
  let room = await rethinkdb
    .db("dd_data")
    .table("rooms")
    .get(id)
    .run(database.connection);
    */

  let room = Room.get(id);

  let items = room.items || [];
  item.id = itemId;
  items.push(item);

  try {
    await Room.updateProperty(id, { items: items });
  } catch (error) {
    throw error;
  }

  return item;
};

/**
 * Clear the items of a given room
 * @param { string } id
 * @returns { Promise.<boolean> } true if there is an error, false otherwise
 */
Room.clearItems = async function (id) {
  try {
    await Room.updateProperty(id, { items: [] });
  } catch (error) {
    throw error;
  }

  return false;
};

/**
 * Clear all of the items in a room
 * @param { string } id
 * @returns { Promise.<boolean> } true if there is an error, false otherwise
 */
Room.removeItem = async function (id, itemID) {
  try {
    const res = await rethinkdb
      .db("dd_data")
      .table("rooms")
      .get(id)
      .update({
        items: rethinkdb.row("items").filter((item) => {
          return item("id").ne(itemID);
        }),
      })
      .run(database.connection);

    return true;
  } catch (error) {
    const err =
      "Failed to remove item " + itemId + " from room " + id + ". " + error;

    console.error(err);
    throw new Error(err);
  }
};

/**
 * Edit the properties of a single item in a room
 * @param { string } id
 * @param { string } itemId
 * @param { object } properties
 * @returns { Promise.<boolean> } true if there is an error, false otherwise
 */
Room.updateItem = async function (id, itemId, properties) {
  try {
    /*
    const res = await rethinkdb
      .db("dd_data")
      .table("rooms")
      .get(id)
      .update({
        items: rethinkdb.row("items").map((item) => {
          return rethinkdb.branch(
            item("id").eq(itemId),
            item.merge(properties),
            item
          );
        }),
      })
      .run(database.connection);*/

    let room = await Room.get(id);

    for (let item in room) {
      if (room[item].id === itemId) {
        console.log("IN: " + JSON.stringify(room[item]));
        room[item] = Object.assign(properties, room[item]);
        console.log("OUT: " + JSON.stringify(room[item]));
      }
    }

    return false;
  } catch (error) {
    const err = "Failed to update item " + itemId + " in room " + id;

    console.error(err);
    throw new Error(err);
  }
};

/**
 * Edit the properties multiple items in a room
 * @param { string } id
 * @param { object } updates Object containg updates to items. Should be of the form { itemID : updates }
 * @returns { Promise.<boolean> } true if there is an error, false otherwise
 */
Room.updateItems = async function (id, updates) {
  try {
    let room = await Room.get(id);

    for (let item in room.items) {
      if (room.items[item].id in updates) {
        console.log("IN: " + JSON.stringify(room.items[item]));
        console.log(updates[room.items[item].id]);
        room.items[item] = Object.assign(
          room.items[item],
          updates[room.items[item].id]
        );
        console.log("OUT: " + JSON.stringify(room.items[item]));
      }
    }

    Cache.client.set(id, JSON.stringify(room));

    return false;
  } catch (error) {
    const err =
      "Failed to complete item updates " +
      JSON.stringify(updates) +
      " in room " +
      id +
      ". " +
      error;

    console.error(err);
    throw new Error(err);
  }
};

Room.save = async function (id) {
  let room = await Room.get(id);

  await rethinkdb
    .db("dd_data")
    .table("rooms")
    .get(id)
    .update(room)
    .run(database.connection);

  console.log("Room " + id + " pushed from cache to database.");
};

module.exports = Room;
