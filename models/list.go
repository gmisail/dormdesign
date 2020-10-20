package models

import (
	"fmt"
	rdb "gopkg.in/rethinkdb/rethinkdb-go.v6"
)

type ListItem struct {
	Id string
	Name string
	Quantity int
	ClaimedBy string
	Editable bool
	Properties map[string]string
}

type List struct {
	Id string `rethinkdb:"id"`
	Items []ListItem `rethinkdb:"Items"`
}

/*
	Create an empty list with the given ID
*/
func CreateList(database *rdb.Session, id string) {
	err := rdb.DB("dd-data").Table("lists").Insert(List{ Id: id, Items: nil }).Exec(database)

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
		return List{}, err
	}

	var data List
	res.One(&data)

	if err != nil {
		fmt.Println(err)
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
