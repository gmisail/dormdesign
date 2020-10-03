package routes

import (
	"fmt"
	"strconv"
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

Queries should be in the following format:

{
	id: string
	name: string
	quantity: int
	claimedBy: string
}

*/
func (route *ListRoute) OnAddListItem(c echo.Context) error {
	id := c.FormValue("id")
	name := c.FormValue("name")
	quantity, convErr := strconv.Atoi(c.FormValue("quantity"))

	if convErr != nil {
		fmt.Println(convErr)
	}

	claimedBy := c.FormValue("claimedBy")

	models.AddListItem(route.Database, id, models.ListItem{ Name: name, Quantity: quantity, ClaimedBy: claimedBy })

	return c.String(http.StatusOK, "added item to list")
}
