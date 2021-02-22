package main

import (
	"os"

	"github.com/gmisail/dormdesign/routes"
	"github.com/gmisail/dormdesign/sockets"
	"github.com/labstack/echo/v4"

	rdb "gopkg.in/rethinkdb/rethinkdb-go.v6"
)

func SetupSockets(e *echo.Echo, database *rdb.Session) {
	hub := sockets.CreateHub(database)
	go hub.Run()

	e.GET("/ws", func(c echo.Context) error {
		sockets.ServeSockets(hub, c)

		return nil
	})
}

// SetupRoutes: configures the API endpoints
func SetupRoutes(e *echo.Echo, database *rdb.Session) {
	SetupSockets(e, database)
	
	roomRoute := routes.RoomRoute{ Database: database }

	/* room related routes*/
	e.GET("/api/room/get", roomRoute.OnGetRoom)
	e.GET("/api/room/clone", roomRoute.OnCloneRoom)
	e.POST("/api/room/create", roomRoute.OnCreateRoom)
	e.POST("/api/room/add", roomRoute.OnAddRoomItem)
}

// SetupServer: configures the Echo server and related middleware.
func SetupServer(e *echo.Echo) {
	/*
		middleware goes here
	*/
	
	databaseAddress := os.Getenv("DATABASE_ADDRESS")
	database := SetupDatabase(databaseAddress)

	SetupRoutes(e, database)
}