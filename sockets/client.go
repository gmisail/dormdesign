package sockets

import (
	"log"
	"time"
	"net/http"
	"encoding/json"
	"errors"

	"github.com/gmisail/dormdesign/models"
	"github.com/labstack/echo/v4"
	"github.com/gorilla/websocket"
	"github.com/google/uuid"
	"github.com/mitchellh/mapstructure"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {		// Allows connections from any origin
		return true	
	},
}

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	id string
	hub *Hub
	conn *websocket.Conn
	send chan []byte
}

/*
	Reads incoming data. Data should be in JSON with format:
	{
		room (room ID)
		event (e.g. "itemAdded")
		data {
			Data relevant to event
		}
	}
*/
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, byteMessage, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		
		message, err := c.translateMessage(byteMessage)
		if err != nil {
			log.Println(err)
		} else {	// Only forward message to hub if its valid
			message.sender = c
			c.hub.Send(message)
		}
	}
}

// Helper function used in translateMessage to generate a MessageResponse when an error occurs
func generateErrorMessageResponse(failedEvent string, errorString string) *MessageResponse {
	return &MessageResponse{
		Event: "actionFailed",
		Data: struct{
			Action string `json:"action"`
			Message string `json:"message"`
		}{
			Action: failedEvent,
			Message: errorString,
		},
	}
}

// Takes in raw message data and returns a Message object if its valid. Otherwise, returns error.
func (c *Client) translateMessage(byteMessage []byte) (Message, error) {
	var message interface{}

	// Decode JSON data
	err := json.Unmarshal(byteMessage, &message)
	if err != nil {
		return Message{}, err
	}

	// Assert that data is a map
	messageMap, ok := message.(map[string]interface{})
	if !ok {
		return Message{}, errors.New("ERROR Incorrect message format")
	}

	roomID, ok := messageMap["room"].(string)
	if !ok {
		return Message{}, errors.New("ERROR Unable to decode room ID from message data")
	}

	data, ok := messageMap["data"].(map[string]interface{})
	if !ok {
		return Message{}, errors.New("ERROR Message missing required \"data\" field")
	}

	event, ok := messageMap["event"].(string)
	if !ok {
		return Message{}, errors.New("ERROR Message event isn't a string")
	}

	sendResponse, ok := messageMap["sendResponse"].(bool)
	if !ok {
		return Message{}, errors.New("ERROR Message missing 'sendResponse' field")
	}

	includeOtherClients := true

	// Set if there's an error handling an event. If set, an error MessageResponse will be generated and returned
	var errorString string

	var response *MessageResponse
	response = nil

	// Handle different message events based on value of "event" field in message JSON
	switch event {
	case "addItem":
		/*
			Create new ListItem model
		*/
		var item models.ListItem
		err := mapstructure.Decode(data, &item)
		item.ID = uuid.New().String()
		if err != nil {
			errorString = "Unable to translate addItem event: " + err.Error()
			break
		}
		
		err = models.AddListItem(c.hub.database, roomID, item)
		if err != nil {
			errorString = "Error adding item to database: " + err.Error()
			break
		}

		log.Printf("ADDED ITEM %+v\n", item)
		
		response = &MessageResponse{
			Event: "itemAdded",
			Data: item,
		}

	case "updateItem", "updateItemInEditor":	
		/*
			Edit property/properties of existing ListItem
		*/

		itemID, ok := data["itemID"].(string)
		// Get map of updated properties and their values
		updated, ok := data["updated"].(map[string]interface{})

		if !ok {
			errorString = "Incorrect/missing fields in received event."
			break
		}
	
		_, err := models.EditListItem(c.hub.database, roomID, itemID, updated)
		if err != nil {
			errorString = "Error editing item in database: " + err.Error()
			break
		}

		log.Printf("UPDATED ITEM %s %+v\n", itemID, updated)
		
		response = &MessageResponse{
			Event: "itemUpdated",
			Data: struct{
				ID string `json:"id"`
				Updated map[string]interface{} `json:"updated"`
			}{
				ID: itemID,
				Updated: updated,
			},
		}

	case "deleteItem":
		/*
			Delete ListItem
		*/
		itemID, ok := data["itemID"].(string)
		if !ok {
			errorString = "Incorrect/missing fields in received event."
			break
		}
		
		err = models.RemoveListItem(c.hub.database, roomID, itemID)
		if err != nil {
			errorString = "Error removing item from list: " + err.Error()
			break
		}

		log.Printf("DELETED ITEM %s", itemID)

		response = &MessageResponse{
			Event: "itemDeleted",
			Data: struct{
				ID string `json:"id"`
			}{
				ID: itemID,
			},
		}
	case "updateLayout":
		verts := data["vertices"].([]interface{})
		updatedVerts := make([]models.EditorPoint, len(verts))
		
		for i := range verts {
			vert := verts[i].(map[string]interface{})
			x := vert["x"].(float64)
			y := vert["y"].(float64)

			updatedVerts[i] = models.EditorPoint{X: x, Y: y}
		}

		err := models.UpdateVertices(c.hub.database, roomID, updatedVerts)
		if err != nil {
			errorString = "Error updating room layout in database: " + err.Error()
			break
		}

	default:
		return Message{}, errors.New("ERROR Unknown event: " + event)
	}

	if (errorString != "") {
		log.Printf(errorString)
		response = generateErrorMessageResponse(event, errorString)
		// Send error message back to sender, but not other clients in room
		includeOtherClients = false
		sendResponse = true
	}

	if response == nil {
		return Message{}, errors.New("ERROR Message response is nil for event: " + event)
	}

	responseBytes, responseBytesErr := json.Marshal(*response)
	if responseBytesErr != nil {
		return Message{}, responseBytesErr
	}

	return Message{ room: roomID, includeSender: sendResponse, includeOtherClients: includeOtherClients, sender: c, response: responseBytes }, nil
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued chat messages to the current websocket message.
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}


func ServeSockets(hub *Hub, c echo.Context) {
	conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		log.Println(err)
		return
	}

	id := c.FormValue("id")

	client := &Client{id: id, hub: hub, conn: conn, send: make(chan []byte, 256)}
	client.hub.register <- client

	go client.writePump()
	go client.readPump()
}
