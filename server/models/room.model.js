const rethinkdb = require("rethinkdb");
const database = require('../db');
const { v4: uuidv4 } = require('uuid');
const Template = require("./template.model");

let Room = {};

/**
 * type RoomItem struct {
	ID string `json:"id" rethinkdb:"id"`
	Name string `json:"name" rethinkdb:"name"`
	Quantity int `json:"quantity" rethinkdb:"quantity"`
	ClaimedBy string `json:"claimedBy" rethinkdb:"claimedBy"`
	VisibleInEditor bool `json:"visibleInEditor" rethinkdb:"visibleInEditor"`
	Dimensions ItemDimensions `json:"dimensions" rethinkdb:"dimensions"`
	EditorPosition EditorPoint `json:"editorPosition" rethinkdb:"editorPosition"`
	EditorRotation float64 `json:"editorRotation" rethinkdb:"editorRotation"`
	EditorLocked bool `json:"editorLocked" rethinkdb:"editorLocked"`
	EditorZIndex float64 `json:"editorZIndex" rethinkdb:"editorZIndex"`
}

type ItemDimensions struct {
	Width float64 `json:"width" rethinkdb:"width"`
	Length float64 `json:"length" rethinkdb:"length"`
	Height float64 `json:"height" rethinkdb:"height"`
}

type EditorPoint struct {
	X float64 `json:"x" rethinkdb:"x"`
	Y float64 `json:"y" rethinkdb:"y"`
}

type Room struct {
	ID string `json:"id" rethinkdb:"id"`
	Name string `json:"name" rethinkdb:"name"`
	TemplateID string `json:"templateId" rethinkdb:"templateId"`
	Items []RoomItem `json:"items" rethinkdb:"items"`
	Vertices []EditorPoint `json:"vertices" rethinkdb:"vertices"`
}
 */

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

Room.copyFrom = function(){}

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

Room.addItem = function(){}
Room.removeItem = function(){}
Room.clearItems = function(){}
Room.editItem = function(){}

module.exports = Room;