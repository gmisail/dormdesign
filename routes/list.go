package routes

import (
	"log"
	"fmt"
	"github.com/gmisail/dormdesign/models"
	"github.com/labstack/echo/v4"
	"net/http"

	"github.com/google/uuid"
	rdb "gopkg.in/rethinkdb/rethinkdb-go.v6"
)

type ListRoute struct {
	Database *rdb.Session
}

// Generalized ItemForm for incoming item add/edit requests. Works with JSON or urlencoded form.
type ItemForm struct {
	ListID string `json:"listID" form:"listID"`
	ItemID string `json:"id" form:"id"`
	Name string `json:"name" form:"name"`
	Quantity int `json:"quantity" form:"quantity"`
}

func (route *ListRoute) OnGetList(c echo.Context) error {
	id := c.QueryParam("id")
	
	// No ID parameter in request, return 400 - Bad Request
	if id == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Missing list ID parameter in request")
	}

	list, err := models.GetList(route.Database, id)

	// Server failed to fetch list from DB, return 500 - Internal Server Error
	if err != nil {	
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusOK, list)
}

/*

Creates an empty list and returns the ID

*/
func (route *ListRoute) OnCreateList(c echo.Context) error {
	id := uuid.New().String()

	err := models.CreateList(route.Database, id)
	if err != nil {
		log.Println(err)
		return echo.NewHTTPError(http.StatusInternalServerError)
	}
 
	return c.JSON(http.StatusOK, id)
}

/*

Queries should be in the following format:

{
	listID: string
	name: string
	quantity: int
	claimedBy: string
	editable: bool
}

The editable field indicates whether or not the item is visible within
the room editor.

*/
func (route *ListRoute) OnAddListItem(c echo.Context) error {

	form := new(ItemForm);

	// Failed to bind ItemForm to Echo context, return 400 - Bad Request
	err := c.Bind(form);
	if err != nil {
		log.Println(err);
		return echo.NewHTTPError(http.StatusBadRequest, "Error processing request data")
	}

	// Form Validation
	listID := form.ListID;
	if listID == "" {
		return echo.NewHTTPError(http.StatusNotFound, "Missing list id")
	}

	itemID := uuid.New().String()
	item := models.ListItem{
		ID: itemID,
		Name: form.Name,					// If not provided in form, will be ""
		Quantity: form.Quantity,	// If not provided in form, will be 0
		VisibleInEditor: false,
		Dimensions: models.ItemDimensions{},
		EditorPosition: models.EditorPoint{},
	}

	models.AddListItem(route.Database, listID, item)

	return c.JSON(http.StatusOK, item)
}

func (route *ListRoute) OnDownloadData(c echo.Context) error {
	id := c.QueryParam("id")

	c.Response().Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s.json", id))
	c.Response().Header().Set("Content-Type", c.Request().Header.Get("Content-Type"))

	return c.String(http.StatusOK, "{}")
}