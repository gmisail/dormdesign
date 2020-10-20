package models

import (
	"fmt"
	"errors"
	rdb "gopkg.in/rethinkdb/rethinkdb-go.v6"
)

type ListItem struct {
	ID string `json:"id"`
	Name string `json:"name"`
	Quantity int `json:"quantity"`
	ClaimedBy string `json:"claimedBy"`
	Editable bool `json:"editable"`
	Properties map[string]string `json:"properties"`
}

type List struct {
	ID string `rethinkdb:"id"`
	Items []ListItem `rethinkdb:"Items"`
}

/*
	Create an empty list with the given ID
*/
func CreateList(database *rdb.Session, id string) {
	err := rdb.DB("dd-data").Table("lists").Insert(List{ ID: id, Items: nil }).Exec(database)

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

	data.Items = append(data.Items, item)

	updateErr := rdb.DB("dd-data").Table("lists").Get(id).Update(data).Exec(database)

	if updateErr != nil {
		fmt.Println(updateErr)
	}
}
