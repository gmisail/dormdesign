package models

import (
	/*"fmt"
	"context"*/
	"fmt"
	rdb "gopkg.in/rethinkdb/rethinkdb-go.v6"
)

type ListItem struct {
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
