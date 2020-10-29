package models

import (
	"errors"
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
	Items map[string]ListItem `json:"items" rethinkdb:"items"`
}

/*
	Create an empty list with the given ID
*/
func CreateList(database *rdb.Session, id string) error {
	err := rdb.DB("dd-data").Table("lists").Insert(List{ ID: id, Items: map[string]ListItem{} }).Exec(database)

	if err != nil {
		return err
	}
	
	return nil
}

/*
	Returns a specific list
*/
func GetList(database *rdb.Session, id string) (List, error) {
	res, err := rdb.DB("dd-data").Table("lists").Get(id).Run(database)

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

/*
	Add a list item to the list at the given room ID
*/
func AddListItem(database *rdb.Session, roomID string, item ListItem) error {
	res, err := rdb.DB("dd-data").Table("lists").Get(roomID).Run(database)

	var data List
	res.One(&data)

	if err != nil {
		return err;
	}

	defer res.Close()

	data.Items[item.ID] = item

	updateErr := rdb.DB("dd-data").Table("lists").Get(roomID).Update(data).Exec(database)

	if updateErr != nil {
		return updateErr;
	}

	return nil
}

func EditListItem(database *rdb.Session, id string, itemID string, updated map[string]interface{}) (*ListItem, error) {
	res, err := rdb.DB("dd-data").Table("lists").Get(id).Run(database)

	var data List
	res.One(&data)

	if err != nil {
		return nil, err
	}

	defer res.Close()

	item, ok := data.Items[itemID]
	if !ok {
		return nil, errors.New("ERROR Updating ListItem. Unable to find item matching id: " + itemID)
	}
	
	for property, value := range updated {
		switch property {
		case "name": 
			item.Name = value.(string)
		case "quantity":
			item.Quantity = int(value.(float64))
		case "claimbedBy":
			item.ClaimedBy = value.(string)
		case "visibleInEditor":
			item.VisibleInEditor = value.(bool)
		case "dimensions":
			dimensions := value.(map[string]interface{})
			item.Dimensions.Width = dimensions["width"].(float64)
			item.Dimensions.Length = dimensions["length"].(float64)
			item.Dimensions.Height = dimensions["height"].(float64)

		case "editorPosition":
			coord := value.(map[string]interface{})
		
			item.EditorPosition.X = coord["x"].(float64)
			item.EditorPosition.Y = coord["y"].(float64)

		default:
			return nil, errors.New("ERROR Updating ListItem. Unknown property: " + property)
		}
	}

	updateErr := rdb.DB("dd-data").Table("lists").Get(id).Update(map[string]interface{}{"items": map[string]interface{}{item.ID: item}}).Exec(database)
	if updateErr != nil {
		return nil, updateErr
	}
	
	return &item, nil
}