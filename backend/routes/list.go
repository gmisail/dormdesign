package routes

import (
	"net/http"
	"github.com/labstack/echo/v4"
	"github.com/gmisail/dormdesign/models"

	rdb "gopkg.in/rethinkdb/rethinkdb-go.v6"
)

type ListRoute struct {
	Database *rdb.Session
}

/*

Creates an empty list for a given ID.

{
	id: string
}

*/
func (route *ListRoute) OnCreateList(c echo.Context) error {
	models.CreateList(route.Database, "testtest")

	return c.String(http.StatusOK, "new list")
}

/*

{
	id: string
	name: string
	quantity: int
	claimedBy: string
}

*/
func (route *ListRoute) OnAddListItem(c echo.Context) error {
	models.AddListItem(route.Database, "testtest", models.ListItem{ Name: "Another", Quantity: 3, ClaimedBy: "graham" })

	return c.String(http.StatusOK, "added item to list")
}
