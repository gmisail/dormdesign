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

	// Field that indicates whether or not to a message response back to sender. If not present, default is true
	respond, ok := messageMap["respond"].(bool)
	if !ok {
		respond = true;
	}

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
			return Message{}, err
		}
		
		models.AddListItem(c.hub.database, roomID, item)

		log.Printf("ADDED ITEM %+v\n", item)
		
		response := MessageResponse{
			Event: "itemAdded",
			Data: item,
		}
		responseBytes, responseBytesErr := json.Marshal(response)
		if responseBytesErr != nil {
			return Message{}, responseBytesErr
		}
		
		return Message{ room: roomID, includeSender: respond, sender: c, response: responseBytes }, nil
	case "updateItem":	
		/*
			Update property/properties of existing ListItem
		*/

		itemID := data["itemID"].(string)
		// Get map of updated properties and their values
		updated := data["updated"].(map[string]interface{})
	
		_, err := models.EditListItem(c.hub.database, roomID, itemID, updated)
		if err != nil {
			return Message{}, err
		}

		log.Printf("UPDATED ITEM %s %+v\n", itemID, updated)
		
		response := MessageResponse{
			Event: "itemUpdated",
			Data: struct{
				ID string `json:"id"`
				Updated map[string]interface{} `json:"updated"`
			}{
				ID: itemID,
				Updated: updated,
			},
		}
		responseBytes, responseBytesErr := json.Marshal(response)
		if responseBytesErr != nil {
			return Message{}, responseBytesErr
		}

		return Message{ room: roomID, includeSender: respond, sender: c, response: responseBytes }, nil

	case "deleteItem":
		/*
			Delete ListItem
		*/
		return Message{}, errors.New("Event not supported yet")
	default:
		return Message{}, errors.New("ERROR Unknown event: " + event)
	}
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
