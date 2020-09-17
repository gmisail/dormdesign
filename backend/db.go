package main

import (
	"log"

	rt "gopkg.in/rethinkdb/rethinkdb-go.v6"
)

type Database struct {
	Session* rt.Session
}

// SetupDatabase: connect to RethinkDB instance and return session pointer
func SetupDatabase(url string) *Database {
	session, err := rt.Connect(rt.ConnectOpts{ Address: url })

	if err != nil {
		log.Fatalln(err)
	}

	return &Database{ Session: session }
}