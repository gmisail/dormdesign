package models

import (
	"fmt"
	"context"
	"encoding/json"
	"github.com/go-redis/redis/v8"
)

type ListItem struct {
	Name string
	Quantity int
	ClaimedBy string
}

type List struct {
	Id string
	Items []ListItem
} 

/*
	Create an empty list with the given ID
*/
func CreateList(database *redis.Client, id string) {
	list := List{ Id: id, Items: nil }
	listJson, listErr := json.Marshal(list)

	if listErr != nil {
		fmt.Println(listErr)
	}

	dbErr := database.Set(context.Background(), id, listJson, 0).Err()

	if dbErr != nil {
		fmt.Println(dbErr)
	}
}

/*
	Add a list item to the list at the given ID
*/
func AddListItem(database *redis.Client, id string, item ListItem) {
	listData, dbErr := database.Get(context.Background(), id).Result()

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
	}
}
