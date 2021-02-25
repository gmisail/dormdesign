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

Room.create = async function(name)
{
    let vertices = [
        { x: -5, y: -5 },
        { x: 5, y: -5 },
        { x: 5, y: 5 },
        { x: -5, y: 5}
    ];

    const id = uuidv4();
	const templateId = Template.create(id);

    const room = {
        id,
        name,
        items: [],
        templateId,
        vertices
	};
	
    const res = await rethinkdb.db("dd_data").table("rooms").insert(room).run(database.connection);
	
    return room;
}

Room.get = async function(id)
{
   const room = await rethinkdb.db("dd_data").table('rooms').get(id).run(database.connection);
   
   return room;
}

Room.copyFrom = function(){}
Room.updateVertices = function(){}
Room.updateRoomName = function(){}
Room.addItem = function(){}
Room.removeItem = function(){}
Room.clearItems = function(){}
Room.editItem = function(){}

module.exports = Room;