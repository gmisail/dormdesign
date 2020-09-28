package routes

import (
	"net/http"
	"github.com/labstack/echo/v4"
	"github.com/go-redis/redis/v8"
	"github.com/gmisail/dormdesign/models"
)

type ListRoute struct {
	Database *redis.Client
}

func (route *ListRoute) OnCreateList(c echo.Context) error {
	models.CreateList(route.Database, "testtesttest")

	return c.String(http.StatusOK, "new list")
}

func (route *ListRoute) OnAddListItem(c echo.Context) error {
	models.AddListItem(route.Database, "testtesttest", models.ListItem{ Name: "Another", Quantity: 3, ClaimedBy: "graham" })

	return c.String(http.StatusOK, "added item to list")
}
