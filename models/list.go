package models

import (
	"errors"
	"fmt"
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
	err := rdb.DB("dd_data").Table("lists").Insert(List{ ID: id, Items: []ListItem{} }).Exec(database)

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
	fmt.Println("updating verts")

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

	return err;
}

func EditListItem(database *rdb.Session, id string, itemID string, updated map[string]interface{}) (*ListItem, error) {
	res, err := rdb.DB("dd_data").Table("lists").Get(id).Field("items").Filter(rdb.Row.Field("id").Eq(itemID)).Run(database)

	var item ListItem;
	res.One(&item);

	if err != nil {
		return nil, err
	}

	defer res.Close();
	
	for property, value := range updated {
		switch property {
		case "name": 
			if value == nil {
				item.Name = ""
			} else {
				item.Name = value.(string)
			}
		case "quantity":
			if value == nil {
				item.Quantity = 0
			} else {
				item.Quantity = int(value.(float64))
			}
		case "claimedBy":
			if value == nil {
				item.ClaimedBy = ""
			} else {
				item.ClaimedBy = value.(string)
			}
		case "visibleInEditor":
			if value == nil {
				item.VisibleInEditor = false
			} else {
				item.VisibleInEditor = value.(bool)
			}
		case "dimensions":
			if value == nil {
				item.Dimensions = ItemDimensions{}
			} else {
				dimensions := value.(map[string]interface{})
				if dimensions["width"] == nil {
					item.Dimensions.Width = 0.0
				} else {
					item.Dimensions.Width = dimensions["width"].(float64)
				}
				if dimensions["height"] == nil {
					item.Dimensions.Height = 0.0
				} else {
					item.Dimensions.Height = dimensions["height"].(float64)
				}
				if dimensions["length"] == nil {
					item.Dimensions.Length = 0.0
				} else {
					item.Dimensions.Length = dimensions["length"].(float64)
				}
			}
		case "editorPosition":
			if value == nil {
				item.EditorPosition = EditorPoint{}
			} else {
				coord := value.(map[string]interface{})

				if coord["x"] == nil {
					item.EditorPosition.X = 0.0
				} else {
					item.EditorPosition.X = coord["x"].(float64)
				}
				
				if coord["y"] == nil {
					item.EditorPosition.Y = 0.0
				} else {
					item.EditorPosition.Y = coord["y"].(float64)
				}
			}
		case "editorRotation":
			if value == nil {
				item.EditorRotation = 0.0
			} else {
				item.EditorRotation = value.(float64)
			}
		case "editorLocked":
			if value == nil {
				item.EditorLocked = false
			} else {
				item.EditorLocked = value.(bool)
			}
		default:
			return nil, errors.New("ERROR Updating ListItem. Unknown property: " + property)
		}
	}

	err = rdb.DB("dd_data").Table("lists").Get(id).Update(map[string]interface{}{
		"items": rdb.Row.Field("items").Map(func(c rdb.Term) interface{} {
			return rdb.Branch(c.Field("id").Eq(itemID), item, c)
		}),
	}).Exec(database)
	// log.Printf("%+v\n", response)
	if err != nil {
		return nil, err
	}
	
	return &item, nil
}