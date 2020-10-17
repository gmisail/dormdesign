package main

import (
	"log"
	
	rdb "gopkg.in/rethinkdb/rethinkdb-go.v6"
)

func SetupDatabase(url string) *rdb.Session {
	session, err := rdb.Connect(rdb.ConnectOpts{
		Address: url,
	})

	if err != nil {
		log.Fatalln(err)
	}

	return session
}