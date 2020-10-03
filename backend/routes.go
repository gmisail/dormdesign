package main

import (
	"os"
	"net/http"
	"github.com/labstack/echo/v4"
	"github.com/gmisail/dormdesign/models"
	"github.com/gmisail/dormdesign/routes"

	rdb "gopkg.in/rethinkdb/rethinkdb-go.v6"
)

// SetupRoutes: configures the API endpoints
func SetupRoutes(e *echo.Echo, database *rdb.Session) {
	e.GET("/", func(c echo.Context) error {
		models.CreateList(database, "testtesttest")
		models.AddListItem(database, "testtesttest", models.ListItem{ Name: "Another", Quantity: 3, ClaimedBy: "graham" })

		return c.String(http.StatusOK, "Hello from DormDesign")
	})

	listRoute := routes.ListRoute{ Database: database }

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