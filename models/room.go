package models

import (
	"log"
	"errors"

	rdb "gopkg.in/rethinkdb/rethinkdb-go.v6"
)

type RoomItem struct {
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
	Items []RoomItem `json:"items" rethinkdb:"items"`
	Vertices []EditorPoint `json:"vertices" rethinkdb:"vertices"`
}

/*
	Create an empty room with the given ID. Return created room struct on if successful
*/
func CreateRoom(database *rdb.Session, id string, name string) (Room, error) {
	/* 
		unless another arrangement is provided, let the default
		room layout just be a 10x10 square
	*/	
	defaultVertices := make([]EditorPoint, 4)
	defaultVertices[0] = EditorPoint{ X: 0, Y: 0 }
	defaultVertices[1] = EditorPoint{ X: 10, Y: 0}
	defaultVertices[2] = EditorPoint{ X: 10, Y: 10}
	defaultVertices[3] = EditorPoint{ X: 0, Y: 10 }

	room := Room{ 
		ID: id,
		Name: name,
		Items: []RoomItem{}, 
		Vertices: defaultVertices,
	}
	
	err := rdb.DB("dd_data").Table("rooms").Insert(room).Exec(database)

	if err != nil {
		return Room{}, err
	}
	
	return room, nil
}

/*
	Returns a specific room
*/
func GetRoom(database *rdb.Session, id string) (Room, error) {
	res, err := rdb.DB("dd_data").Table("rooms").Get(id).Run(database)

	if err != nil {
		return Room{}, err
	}

	var data Room
	err = res.One(&data)

	if err == rdb.ErrEmptyResult {
		err = errors.New("Room not found")
	}

	if err != nil {
		return Room{}, err
	}

	defer res.Close()

	return data, nil
}

/*
	Copy the contents of the room with ID 'target' into 'id'.
*/
func CopyRoom(database *rdb.Session, id string, target string) (Room, error) {
	// Get target room data(room that will be cloned)
	data, err := GetRoom(database, target)

	if err != nil {
		log.Println(err)
		return Room{}, err
	}

	// Set change ID of target to this room's id
	data.ID = id
	// Update this room with target's data
	_, err = rdb.DB("dd_data").Table("rooms").Get(id).Update(data).RunWrite(database)
	if err != nil {
		log.Println(err)
		return Room{}, err
	}

	return data, nil
}

func UpdateVertices(database *rdb.Session, id string, verts []EditorPoint) error {
	err := rdb.DB("dd_data").Table("rooms").Get(id).Update(map[string]interface{}{
		"vertices": verts,
	}).Exec(database)

	return err
}

/*
	Add a room item to the room at the given room ID
*/
func AddRoomItem(database *rdb.Session, roomID string, item RoomItem) error {
	err := rdb.DB("dd_data").Table("rooms").Get(roomID).Update(map[string]interface{}{"items": rdb.Row.Field("items").Default([]RoomItem{}).Append(item)}).Exec(database)

	if err != nil {
		return err
	}

	return nil
}

func RemoveRoomItem(database *rdb.Session, roomID string, itemID string) error {
	err := rdb.DB("dd_data").Table("rooms").Get(roomID).Update(map[string]interface{}{
		"items": rdb.Row.Field("items").Filter(func(item rdb.Term) interface{} {
			return item.Field("id").Ne(itemID)
		}),
	}).Exec(database)

	return err
}

func ClearRoomItems(database *rdb.Session, roomID string) error {
	err := rdb.DB("dd_data").Table("rooms").Get(roomID).Update(
		map[string]interface{}{
			"items": nil,
	}).Exec(database)

	return err
}

func EditRoomItem(database *rdb.Session, id string, itemID string, updated map[string]interface{}) error {

	err := rdb.DB("dd_data").Table("rooms").Get(id).Update(map[string]interface{}{
		// Loop over items. When item with matching id is found, merge it with updates
		"items": rdb.Row.Field("items").Map(func(c rdb.Term) interface{} {
			return rdb.Branch(c.Field("id").Eq(itemID), c.Merge(updated), c)
		}),
	}).Exec(database)
	if err != nil {
		return err
	}
	
	return nil
}