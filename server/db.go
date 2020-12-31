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

	_, err = rdb.DBCreate("dd_data").RunWrite(session)
	if err == nil {
		log.Println("Created database 'dd_data'")
	}

	_, err = rdb.DB("dd_data").TableCreate("rooms").RunWrite(session)
	if err == nil {
		log.Println("Created table 'rooms'")
	}

	_, err = rdb.DB("dd_data").TableCreate("templates").RunWrite(session)
	if err == nil {
		log.Println("Created table 'templates'")
	}

	return session
}