const rethinkdb = require("rethinkdb");
const database = require('../db');
const { v4: uuidv4 } = require('uuid');
const Template = require("./template.model");

let Room = {};

/**
 * Create a new room with a given name
 * @param { string } name 
 * @returns { object } room object if it exists, null otherwise
 */
Room.create = async function(name)
{
    let vertices = [
        { x: -5, y: -5 },
        { x: 5, y: -5 },
        { x: 5, y: 5 },
        { x: -5, y: 5}
    ];

    const id = uuidv4();
	const templateId = await Template.create(id);

    const room = {
        id,
        name,
        items: [],
        templateId,
        vertices
	};
	
    const res = await rethinkdb.db("dd_data").table("rooms").insert(room).run(database.connection);
	
	if(res === null)
	{
		console.error("Could not insert room.");
		return null;
	}

    return room;
}

/**
 * Get the JSON data from a room at an ID
 * @param { string } id 
 * @returns { object } room object if it exists, null otherwise
 */
Room.get = async function(id)
{
	const room = await rethinkdb.db("dd_data").table('rooms').get(id).run(database.connection);
   
	if(room === null)
	{
		console.error("Could not get room with id " + id);
		return null;
	}

	return room;
}

/**
 * Copy data from templateId into room with ID id
 * @param { string } id 
 * @param { string } templateId 
 * @returns { boolean } true if there is an error, false otherwise
 */
Room.copyFrom = async function(id, templateId)
{
	const room = await Room.get(id);
	const template = await Template.get(templateId);
	const templateData = await Room.get(template.targetId);

	templateData.id = room.id;
	templateData.templateId = room.templateId;
	templateData.name = room.name

	const err = await Room.updateProperty(id, templateData);

	if(err) 
	{
		console.error("Could not copy room " + templateId + " to " + id);
		return err;
	}

	return false;
}

/**
 * Updates the given property in a room.
 * @param { string } id 
 * @param { JSON } data 
 * @returns { boolean } true if there is an error, false otherwise
 */
Room.updateProperty = async function(id, data) 
{
	let res = await rethinkdb.db('dd_data').table("rooms").get(id).update(data).run(database.connection);
	
	/* res.skipped refers to how many operations it skips; if it skips a non-zero amount then we know something is up. */
	if(res.skipped !== 0) 
	{
		console.log("Could not update property: " + JSON.stringify(data) + ", at ID " + id);
		
		return true;
	}
	
	return false;
}

/**
 * Update the vertices of a given room
 * @param { string } id 
 * @param { array[{ x: number, y: number }] } vertices 
 * @returns { boolean } true if there is an error, false otherwise
 */
Room.updateVertices = async function(id, vertices) 
{
	let res = await Room.updateProperty(id, { "vertices": vertices });
	return res;
}

/**
 * Update the name of a given room
 * @param { string } id 
 * @param { string } name 
 * @returns { boolean } true if there is an error, false otherwise
 */
Room.updateRoomName = async function(id, name)
{
	let res = await Room.updateProperty(id, { "name": name });
	return res;
}

/**
 * Add an item (generated by the Item model schema) to a given room
 * @param { string } id 
 * @param { JSON } item 
 * @returns { object } null if there is an error, otherwise returns the new Item
 */
Room.addItem = async function(id, item)
{
	const itemId = uuidv4();

	let room = await rethinkdb.db("dd_data").table("rooms").get(id).run(database.connection);

	let items = room.items || [];
	item.id = itemId;
	items.push(item);

	const err = await Room.updateProperty(id, { "items": items });

	if(err) 
	{
		console.error("Could not add item to room " + id);

		return null;
	}

	return item;
}

/**
 * Clear the items of a given room
 * @param { string } id 
 * @returns { boolean } true if there is an error, false otherwise
 */
Room.clearItems = async function(id)
{
	const err = await Room.updateProperty(id, { "items": [] });

	if(err)
	{
		console.error("Could not clear room with ID " + id);
		return err;
	}

	return false;
}

/**
 * Clear all of the items in a room
 * @param { string } id 
 * @returns { boolean } true if there is an error, false otherwise
 */
Room.removeItem = async function(id, itemId)
{
	let res = await Room.get(id);

	if(res.items === undefined || res.items.length == 0)
		return;

	let items = res.items.filter(item => item.id !== itemId);

	const err = await Room.updateProperty(id, { "items": items });

	if(err)
	{
		console.error("Could not remove item " + itemId + " from room " + id);
		return err;
	}

	return false;
}

/**
 * Edit the properties of an item in the room
 * @param { string } id
 * @param { string } itemId
 * @param { object } properties
 * @returns { boolean } true if there is an error, false otherwise
 */
Room.editItem = async function(id, itemId, properties)
{
	let res = await Room.get(id);

	if(res.items === undefined || res.items.length == 0)
		return;

	for (let i = 0; i < res.items.length; i++) {
		if(res.items[i].id === itemId) {
			for (const property in properties) {
				res.items[i][property] = properties[property];
			}

			const err = await Room.updateProperty(id, { "items": res.items });

			if(err)
			{
				console.error("Could not edit item " + itemId + " in room " + id);
			}

			return err;
		}
	}
}

module.exports = Room;