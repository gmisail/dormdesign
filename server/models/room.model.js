const rethinkdb = require("rethinkdb");
const database = require('../db');
const { v4: uuidv4 } = require('uuid');
const Template = require("./template.model");

let Room = {};

/**
 * Create a new room with a given name
 * @param { string } name 
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
		return {};
	}

    return room;
}

/**
 * Get the JSON data from a room at an ID
 * @param { string } id 
 */
Room.get = async function(id)
{
	const room = await rethinkdb.db("dd_data").table('rooms').get(id).run(database.connection);
   
	if(room === null)
	{
		console.log("Could not get room with id " + id);
		return {};
	}

	return room;
}


Room.copyFrom = async function(id, templateId)
{
	const room = await Room.get(id);
	const template = await Template.get(templateId);
	const templateData = await Room.get(template.targetId);

	templateData.id = room.id;
	templateData.templateId = room.templateId;
	templateData.name = room.name

	await Room.updateProperty(id, templateData);
}

/**
 * Updates the given property in a room.
 * @param { string } id 
 * @param { JSON } data 
 */
Room.updateProperty = async function(id, data) 
{
	let res = await rethinkdb.db('dd_data').table("rooms").get(id).update(data).run(database.connection);
	
	/* res.skipped refers to how many operations it skips; if it skips a non-zero amount then we know something is up. */
	if(res.skipped !== 0) 
	{
		console.log("Could not update property: " + JSON.stringify(data) + ", at ID " + id);
		
		return res;
	}
	
	return null;
}

/**
 * Update the vertices of a given room
 * @param { string } id 
 * @param { array[{ x: number, y: number }] } vertices 
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
 */
Room.addItem = async function(id, item)
{
	const itemId = uuidv4();

	let room = await rethinkdb.db("dd_data").table("rooms").get(id).run(database.connection);

	let items = room.items || [];
	item.id = itemId;
	items.push(item);

	await Room.updateProperty(id, { "items": items });
}

/**
 * Clear the items of a given room
 * @param { string } id 
 */
Room.clearItems = async function(id)
{
	await Room.updateProperty(id, { "items": [] });
}

/**
 * Clear all of the items in a room
 * @param { string } id 
 */
Room.removeItem = async function(id, itemId)
{
	let res = await Room.get(id);

	if(res.items === undefined || res.items.length == 0)
		return;

	let items = res.items.filter(item => item.id !== itemId);

	await Room.updateProperty(id, { "items": items });
}

/**
 * Edit the properties of an item in the room
 * @param { string } id
 * @param { string } itemId
 * @param { object } properties
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

			await Room.updateProperty(id, { "items": res.items });

			return;
		}
	}
}

module.exports = Room;