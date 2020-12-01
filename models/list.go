package models

import (
	"errors"
	"reflect"

	"github.com/gmisail/dormdesign/utils"
	rdb "gopkg.in/rethinkdb/rethinkdb-go.v6"
)

type ListItem struct {
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

type List struct {
	ID string `json:"id" rethinkdb:"id"`
	Items []ListItem `json:"items" rethinkdb:"items"`
	Vertices []EditorPoint `json:"vertices" rethinkdb:"vertices"`
}

/*
	Create an empty list with the given ID
*/
func CreateList(database *rdb.Session, id string) error {
	/* 
		unless another arrangement is provided, let the default
		room layout just be a 10x10 square
	*/	
	defaultVertices := make([]EditorPoint, 4)
	defaultVertices[0] = EditorPoint{ X: 0, Y: 0 }
	defaultVertices[1] = EditorPoint{ X: 10, Y: 0}
	defaultVertices[2] = EditorPoint{ X: 10, Y: 10}
	defaultVertices[3] = EditorPoint{ X: 0, Y: 10 }
	
	err := rdb.DB("dd_data").Table("lists").Insert(List{ 
		ID: id, 
		Items: []ListItem{}, 
		Vertices: defaultVertices,
	}).Exec(database)

	if err != nil {
		return err
	}
	
	return nil
}

/*
	Returns a specific list
*/
func GetList(database *rdb.Session, id string) (List, error) {
	res, err := rdb.DB("dd_data").Table("lists").Get(id).Run(database)

	if err != nil {
		return List{}, err
	}

	var data List
	err = res.One(&data)

	if err == rdb.ErrEmptyResult {
		err = errors.New("List not found")
	}
	if err != nil {
		return List{}, err
	}

	defer res.Close()

	return data, nil
}

func UpdateVertices(database *rdb.Session, id string, verts []EditorPoint) error {
	err := rdb.DB("dd_data").Table("lists").Get(id).Update(map[string]interface{}{
		"vertices": verts,
	}).Exec(database)

	return err
}

/*
	Add a list item to the list at the given room ID
*/
func AddListItem(database *rdb.Session, roomID string, item ListItem) error {
	err := rdb.DB("dd_data").Table("lists").Get(roomID).Update(map[string]interface{}{"items": rdb.Row.Field("items").Default([]ListItem{}).Append(item)}).Exec(database)

	if err != nil {
		return err
	}

	return nil
}

func RemoveListItem(database *rdb.Session, roomID string, itemID string) error {
	err := rdb.DB("dd_data").Table("lists").Get(roomID).Update(map[string]interface{}{
		"items": rdb.Row.Field("items").Filter(func(item rdb.Term) interface{} {
			return item.Field("id").Ne(itemID)
		}),
	}).Exec(database)

	return err
}

func ClearListItems(database *rdb.Session, roomID string) error {
	err := rdb.DB("dd_data").Table("lists").Get(roomID).Update(
		map[string]interface{}{
			"items": nil,
	}).Exec(database)

	return err
}

func reflectValue(obj interface{}) reflect.Value {
	var val reflect.Value

	if reflect.TypeOf(obj).Kind() == reflect.Ptr {
		val = reflect.ValueOf(obj).Elem()
	} else {
		val = reflect.ValueOf(obj)
	}

	return val
}

func EditListItem(database *rdb.Session, id string, itemID string, updated map[string]interface{}) (*ListItem, error) {
	res, err := rdb.DB("dd_data").Table("lists").Get(id).Field("items").Filter(rdb.Row.Field("id").Eq(itemID)).Run(database)

	var item ListItem
	res.One(&item)

	if err != nil {
		return nil, err
	}

	defer res.Close()

	err = utils.UpdateStructJSONFields(&item, &updated, true)
	if err != nil {
		return nil, err
	}

	err = rdb.DB("dd_data").Table("lists").Get(id).Update(map[string]interface{}{
		"items": rdb.Row.Field("items").Map(func(c rdb.Term) interface{} {
			return rdb.Branch(c.Field("id").Eq(itemID), item, c)
		}),
	}).Exec(database)
	if err != nil {
		return nil, err
	}
	
	return &item, nil
}