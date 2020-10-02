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
}

type List struct {
	Id string `rethinkdb:"id"`
	Items []ListItem 
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
	fmt.Println(rdb.DB("dd-data").Table("lists").Get(id).Exec(database))

/*	listData, dbErr := database.Get(context.Background(), id).Result()

	if dbErr != nil {
		fmt.Println(dbErr)
	}

	var list List
	listRawData := []byte(listData)
	listErr := json.Unmarshal(listRawData, &list)

	if listErr != nil {
		fmt.Println(listErr)
	}

	list.Items = append(list.Items, item)
	listJson, listJsonErr := json.Marshal(list)

	if listJsonErr != nil {
		fmt.Println(listJsonErr)
	}

	dbErr = database.Set(context.Background(), id, listJson, 0).Err()

	if dbErr != nil {
		fmt.Println(dbErr)
	}*/
}
