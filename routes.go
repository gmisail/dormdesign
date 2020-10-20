package main

import (
	"os"
	"github.com/labstack/echo/v4"
	"github.com/gmisail/dormdesign/routes"
	"github.com/gmisail/dormdesign/sockets"

	rdb "gopkg.in/rethinkdb/rethinkdb-go.v6"
)

func SetupSockets(e *echo.Echo) {
	hub := sockets.CreateHub()
	go hub.Run()

	e.GET("/ws", func(c echo.Context) error {
		sockets.ServeSockets(hub, c)

		return nil
	})
}

// SetupRoutes: configures the API endpoints
func SetupRoutes(e *echo.Echo, database *rdb.Session) {
	SetupSockets(e)
	
	listRoute := routes.ListRoute{ Database: database }

	/* frontend host routes */
	e.Static("/", "frontend/build")
	e.File("/", "frontend/build/index.html")

	/* list related routes*/
	e.GET("/list/get", listRoute.OnGetList)
	e.POST("/list/create", listRoute.OnCreateList)
	e.POST("/list/add", listRoute.OnAddListItem)
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