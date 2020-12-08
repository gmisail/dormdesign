package routes

import (
	"log"

	"github.com/gmisail/dormdesign/models"
	"github.com/labstack/echo/v4"
	"net/http"

	"github.com/google/uuid"
	rdb "gopkg.in/rethinkdb/rethinkdb-go.v6"
)

type RoomRoute struct {
	Database *rdb.Session
}

// Generalized RoomForm for incoming create room requests. Works with JSON or urlencoded form.
type CreateRoomForm struct {
	Name string `json:"name" form:"name"`
}

// Generalized ItemForm for incoming item add/edit requests. Works with JSON or urlencoded form.
type ItemForm struct {
	RoomID string `json:"roomID" form:"roomID"`
	ItemID string `json:"id" form:"id"`
	Name string `json:"name" form:"name"`
	Quantity int `json:"quantity" form:"quantity"`
}

func (route *RoomRoute) OnGetRoom(c echo.Context) error {
	id := c.QueryParam("id")
	
	// No ID parameter in request, return 400 - Bad Request
	if id == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Missing room ID parameter in request")
	}

	room, err := models.GetRoom(route.Database, id)

	// Server failed to fetch room from DB (likely because the ID is invalid), return 404 - Not found
	if err != nil {	
		log.Printf("Error getting room: %s", err);
		return echo.NewHTTPError(http.StatusNotFound)
	}

	return c.JSON(http.StatusOK, room)
}

/*

Creates an empty room and returns the ID

*/
func (route *RoomRoute) OnCreateRoom(c echo.Context) error {
	id := uuid.New().String()

	form := new(CreateRoomForm);

	// Failed to bind ItemForm to Echo context, return 400 - Bad Request
	err := c.Bind(form);
	if err != nil {
		log.Println(err);
		return echo.NewHTTPError(http.StatusBadRequest, "Error processing request data")
	}
	
	// Handle missing name
	if form.Name == "" {
		form.Name = "New Room"
	}

	room, err := models.CreateRoom(route.Database, id, form.Name)
	if err != nil {
		log.Println(err)
		return echo.NewHTTPError(http.StatusInternalServerError)
	}
 
	return c.JSON(http.StatusOK, room)
}

/*

Queries should be in the following format:

{
	roomID: string
	name: string
	quantity: int
	claimedBy: string
	editable: bool
}

The editable field indicates whether or not the item is visible within
the room editor.

*/
func (route *RoomRoute) OnAddRoomItem(c echo.Context) error {

	form := new(ItemForm);

	// Failed to bind ItemForm to Echo context, return 400 - Bad Request
	err := c.Bind(form);
	if err != nil {
		log.Println(err);
		return echo.NewHTTPError(http.StatusBadRequest, "Error processing request data")
	}

	// Form Validation
	roomID := form.RoomID;
	if roomID == "" {
		return echo.NewHTTPError(http.StatusNotFound, "Missing room id")
	}

	itemID := uuid.New().String()
	item := models.RoomItem{
		ID: itemID,
		Name: form.Name,					// If not provided in form, will be ""
		Quantity: form.Quantity,	// If not provided in form, will be 0
		VisibleInEditor: false,
		Dimensions: models.ItemDimensions{},
		EditorPosition: models.EditorPoint{},
	}

	models.AddRoomItem(route.Database, roomID, item)

	return c.JSON(http.StatusOK, item)
}

func (route *RoomRoute) OnCloneRoom(c echo.Context) error {
	id := c.QueryParam("id")
	targetId := c.QueryParam("target_id")

	data, err := models.GetRoom(route.Database, targetId)

	if err != nil {
		log.Println(err)
		return echo.NewHTTPError(http.StatusBadRequest, "Cannot find room with given ID.")
	}

	/* remove all of the current items in the room */
	models.ClearRoomItems(route.Database, id)

	/* replace the current vertices with the target room's vertices */
	models.UpdateVertices(route.Database, id, data.Vertices)

	/* loop through target and add them to current room. Ensures that ID's are new and unique */
	for _, item := range data.Items {
		models.AddRoomItem(route.Database, id, item)
	}

	return c.JSON(http.StatusOK, data)
}

