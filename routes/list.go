package routes

import (
	"fmt"
	"github.com/gmisail/dormdesign/models"
	"github.com/labstack/echo/v4"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	rdb "gopkg.in/rethinkdb/rethinkdb-go.v6"
)

type ListRoute struct {
	Database *rdb.Session
}

type ListResponse struct {
	err string
	data string
}

func (route *ListRoute) OnGetList(c echo.Context) error {
	id := c.FormValue("id")

	list, err := models.GetList(route.Database, id)

	if err != nil {
		return c.JSON(http.StatusNotFound, ListResponse{err: err.Error(), data: "" })
	}

	return c.JSON(http.StatusOK, list)
}

/*

Creates an empty list and returns the ID

*/
func (route *ListRoute) OnCreateList(c echo.Context) error {
	id := uuid.New().String()

	models.CreateList(route.Database, id)
 
	return c.JSON(http.StatusOK, id)
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

	itemId := uuid.New().String()
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

	return c.JSON(http.StatusOK, ListResponse{ err: "", data: "" })
}
