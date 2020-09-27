package main

import (
	"log"
	"github.com/labstack/echo/v4"
	"github.com/joho/godotenv"
)

func main() {
	e := echo.New()
	e.HideBanner = true

	err := godotenv.Load()
	if err != nil {
    	log.Fatal("Error loading .env file")
  	}

	SetupServer(e)

	e.Logger.Fatal(e.Start(":8000"))
}