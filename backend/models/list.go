package models

import (
	"fmt"
	"context"
	"github.com/go-redis/redis/v8"
)

func CreateList(database *redis.Client, id string, name string) {
	err := database.Set(context.Background(), id, "hello", 0)

	if err != nil {
		fmt.Println(err)
	}
}
