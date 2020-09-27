package main

import (
	"os"
	"net/http"
	"github.com/labstack/echo/v4"
)

// SetupRoutes: configures the API endpoints
func SetupRoutes(e *echo.Echo) {
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello from DormDesign")
	})
}

// SetupServer: configures the Echo server and related middleware.
func SetupServer(e *echo.Echo) {
	/*
		middleware goes here
	*/
	
	databaseAddress := os.Getenv("DATABASE_ADDRESS")

	SetupDatabase(databaseAddress)
	SetupRoutes(e)
}