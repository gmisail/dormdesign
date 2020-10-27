package models

import (
	"fmt"
	"errors"
	rdb "gopkg.in/rethinkdb/rethinkdb-go.v6"
)

type ListItem struct {
	ID string `json:"id" rethinkdb:"id"`
	Name string `json:"name" rethinkdb:"name"`
	Quantity int `json:"quantity" rethinkdb:"quantity"`
	ClaimedBy string `json:"claimedBy" rethinkdb:"claimedBy"`
	EditorPosition *EditorPoint `json:"editorPosition"`
}

type EditorPoint struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type List struct {
	ID string `json:"id" rethinkdb:"id"`
	Items map[string]ListItem `json:"items" rethinkdb:"items"`
}

/*
	Create an empty list with the given ID
*/
func CreateList(database *rdb.Session, id string) {
	err := rdb.DB("dd-data").Table("lists").Insert(List{ ID: id, Items: map[string]ListItem{} }).Exec(database)

	if err != nil {
		fmt.Println(err)
	}
}

/*
	Returns a specific list
*/
func GetList(database *rdb.Session, id string) (List, error) {
	res, err := rdb.DB("dd-data").Table("lists").Get(id).Run(database)

	if err != nil {
		fmt.Println(err)
		return List{}, err
	}

	var data List
	err = res.One(&data)

	if err == rdb.ErrEmptyResult {
		err = errors.New("List not found")
	}
	if err != nil {
		fmt.Println(err)
		return List{}, err
	}

	defer res.Close()

	return data, nil
}

/*
	Add a list item to the list at the given ID
*/
func AddListItem(database *rdb.Session, id string, item ListItem) {
	res, err := rdb.DB("dd-data").Table("lists").Get(id).Run(database)

	var data List
	res.One(&data)

	if err != nil {
		fmt.Println(err)
	}

	defer res.Close()

	data.Items[item.ID] = item

	updateErr := rdb.DB("dd-data").Table("lists").Get(id).Update(data).Exec(database)

	if updateErr != nil {
		fmt.Println(updateErr)
	}

}

func EditListItem(database *rdb.Session, id string, itemID string, updated map[string]interface{}) (*ListItem, error) {
	res, err := rdb.DB("dd-data").Table("lists").Get(id).Run(database)

	var data List
	res.One(&data)

	if err != nil {
		fmt.Println(err)
	}

	defer res.Close()

	item, ok := data.Items[itemID]
	if !ok {
		return nil, errors.New("Error updating ListItem. Unable to find item matching id: " + itemID)
	}
	for property, value := range updated {
		switch property {
		case "editorPosition":
			coord := value.(map[string]interface{})
		
			x := coord["x"].(float64)
			y := coord["y"].(float64)

			if item.EditorPosition == nil {
				item.EditorPosition = &EditorPoint{
					X: x,
					Y: y,
				}
			} else {
				item.EditorPosition.X = x
				item.EditorPosition.Y = y
			}
		default:
			return nil, errors.New("Error updating ListItem. Unknown property: " + property)
		}
	}

	updateErr := rdb.DB("dd-data").Table("lists").Get(id).Update(map[string]interface{}{"items": map[string]interface{}{item.ID: item}}).Exec(database)
	if updateErr != nil {
		return nil, updateErr
	}
	
	return &item, nil
}