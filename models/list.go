package models

import (
	"log"
	"errors"

	"github.com/gmisail/dormdesign/utils"
	rdb "gopkg.in/rethinkdb/rethinkdb-go.v6"
)

type RoomItem struct {
	ID string `json:"id" rethinkdb:"id"`
	Name string `json:"name" rethinkdb:"name"`
	Quantity int `json:"quantity" rethinkdb:"quantity"`
	ClaimedBy string `json:"claimedBy" rethinkdb:"claimedBy"`
	VisibleInEditor bool `json:"visibleInEditor" rethinkdb:"visibleInEditor"`
	Dimensions ItemDimensions `json:"dimensions" rethinkdb:"dimensions"`
	EditorPosition EditorPoint `json:"editorPosition"`
	EditorRotation float64 `json:"editorRotation"`
	EditorLocked bool `json:"editorLocked"`
	EditorZIndex float64 `json:"editorZIndex"`
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
	Items []RoomItem `json:"items" rethinkdb:"items"`
	Vertices []EditorPoint `json:"vertices" rethinkdb:"vertices"`
}

/*
	Create an empty room with the given ID
*/
func CreateRoom(database *rdb.Session, id string) error {
	/* 
		unless another arrangement is provided, let the default
		room layout just be a 10x10 square
	*/	
	defaultVertices := make([]EditorPoint, 4)
	defaultVertices[0] = EditorPoint{ X: 0, Y: 0 }
	defaultVertices[1] = EditorPoint{ X: 10, Y: 0}
	defaultVertices[2] = EditorPoint{ X: 10, Y: 10}
	defaultVertices[3] = EditorPoint{ X: 0, Y: 10 }
	
	err := rdb.DB("dd_data").Table("rooms").Insert(Room{ 
		ID: id, 
		Items: []RoomItem{}, 
		Vertices: defaultVertices,
	}).Exec(database)

	if err != nil {
		return err
	}
	
	return nil
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
	data, err := GetRoom(database, target)

	if err != nil {
		log.Println(err)
		return Room{}, err
	}

	/* remove all of the current items in the room */
	clearErr := ClearRoomItems(database, id)

	if clearErr != nil {
		log.Println(clearErr)
		return Room{}, clearErr
	}

	/* replace the current vertices with the target room's vertices */
	vertErr := UpdateVertices(database, id, data.Vertices)

	if vertErr != nil {
		log.Println(vertErr)
		return Room{}, vertErr
	}

	/* 
		loop through target and add them to current room. We don't want to
		re-use the ID's from 'target', so add them manually so that it
		generates a unique ID.
	*/
	for _, item := range data.Items {
		roomErr := AddRoomItem(database, id, item)

		if roomErr != nil {
			log.Println(roomErr)
			return Room{}, roomErr
		}
	}

	data, err = GetRoom(database, target)

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

func EditRoomItem(database *rdb.Session, id string, itemID string, updated map[string]interface{}) (*RoomItem, error) {
	res, err := rdb.DB("dd_data").Table("rooms").Get(id).Field("items").Filter(rdb.Row.Field("id").Eq(itemID)).Run(database)

	var item RoomItem
	res.One(&item)

	if err != nil {
		return nil, err
	}

	defer res.Close()

	err = utils.UpdateStructJSONFields(&item, &updated, true)
	if err != nil {
		return nil, err
	}

	err = rdb.DB("dd_data").Table("rooms").Get(id).Update(map[string]interface{}{
		"items": rdb.Row.Field("items").Map(func(c rdb.Term) interface{} {
			return rdb.Branch(c.Field("id").Eq(itemID), item, c)
		}),
	}).Exec(database)
	if err != nil {
		return nil, err
	}
	
	return &item, nil
}