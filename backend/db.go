package main

import (
	"log"
	"fmt"
	"context"
	"github.com/go-redis/redis/v8"
)

var ctx = context.Background()

func SetupDatabase(url string) *redis.Client {
	client := redis.NewClient(&redis.Options{
		Addr: url,
		Password: "",
		DB: 0,
	})

	_, err := client.Ping(ctx).Result()

	if err != nil {
		log.Fatal(err)
	} else {
		fmt.Println("⇨ connected to database")
	}



	return client
}