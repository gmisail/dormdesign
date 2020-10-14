package routes

import (
	"fmt"
	"strconv"
	"net/http"
	"github.com/labstack/echo/v4"
	"github.com/gmisail/dormdesign/models"
	"time"

	rdb "gopkg.in/rethinkdb/rethinkdb-go.v6"
)

type ListRoute struct {
	Database *rdb.Session
}

type ListResponse struct {
	err string
}

/*

Creates an empty list for a given ID.

{
	id: string
}

*/
func (route *ListRoute) OnCreateList(c echo.Context) error {
	id := c.FormValue("id")

	models.CreateList(route.Database, id)
 
	return c.JSON(http.StatusOK, ListResponse{ err: "" })
}

/*

Queries should be in the following format:

{
	id: string
	name: string
	quantity: int
	claimedBy: string
	editable: bool
}

The editable field indicates whether or not the item is visible within
the room editor.

*/
func (route *ListRoute) OnAddListItem(c echo.Context) error {
	id := c.FormValue("id")
	name := c.FormValue("name")
	quantity, convErr := strconv.Atoi(c.FormValue("quantity"))

	if convErr != nil {
		fmt.Println(convErr)
	}

	itemId := strconv.FormatInt(time.Now().UTC().Unix(), 10)
	claimedBy := c.FormValue("claimedBy")
	editable, _ := strconv.ParseBool(c.FormValue("editable"))

	models.AddListItem(route.Database, id, models.ListItem{
		Id: itemId,
		Name: name,
		Quantity: quantity,
		ClaimedBy: claimedBy,
		Editable: editable,
		Properties: nil,
	})

	return c.JSON(http.StatusOK, ListResponse{ err: "" })
}
