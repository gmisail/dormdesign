package sockets;

import (
	"fmt"
	"log"
	"encoding/json"
	"errors"
	"io"

	"github.com/gmisail/dormdesign/models"
	"github.com/google/uuid"
)

type MessageResponse struct {
	Event string `json:"event"`
	Data interface{} `json:"data"`
}

type RoomMessage struct {
	RoomID string `json:"room"`
	Event string `json:"event"`
	SendResponse bool `json:"sendResponse"`
	Data json.RawMessage `json:"data"`
}

// Takes in socket reader and returns a pointer to the translated Message object if its valid. Otherwise, returns error.
func (c *Client) translateMessage(reader io.Reader) (*Message, error) {

	// Set if there's an error handling an event. If set, an error MessageResponse will be generated at the end of the function and returned
	var errorString string

	var response *MessageResponse
	response = nil

	var roomMessage RoomMessage
	decoder := json.NewDecoder(reader)
	// Throw an error if there are unknown fields in the message - maybe not necessary
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&roomMessage); err != nil {
		errorString = fmt.Sprintf("Failed to decode message: %s", err)
	}

	var err error;
	if roomMessage.RoomID == "" {
		errorString = "Missing/empty 'room' field"
	}
	if roomMessage.Event == "" {
		errorString = "Missing/empty 'event' field"
	}
	if roomMessage.Data == nil {
		errorString = "Missing/empty 'data' field"
	}

	// Only continue handling if there hasn't already been an error
	if errorString == "" {
		// Handle different message events based on value of "event" field in message JSON
		eventHandler:
		switch roomMessage.Event {
		case "addItem":
			/*
				Create new ListItem model
			*/
			var item models.ListItem
			err := json.Unmarshal(roomMessage.Data, &item)
			if err != nil {
				errorString = "Unable to translate addItem event: " + err.Error()
				break
			}
			item.ID = uuid.New().String()
			
			err = models.AddListItem(c.hub.database, roomMessage.RoomID, item)
			if err != nil {
				errorString = "Error adding item to database: " + err.Error()
				break
			}

			log.Printf("ADDED ITEM %+v\n", item)
			
			response = &MessageResponse{
				Event: "itemAdded",
				Data: item,
			}

		case "updateItems":	
			/*
				Edit property/properties of multiple existing ListItems
			*/
			type UpdatedItemsEvent struct {
				Items []struct {
					ID string `json:"id"`
					Updated map[string]interface{} `json:"updated"`
				} `json:"items"`
			}

			var eventData UpdatedItemsEvent
			//err := mapstructure.Decode(roomMessage.Data, &eventData)
			if err := json.Unmarshal(roomMessage.Data, &eventData); err != nil {
				errorString = fmt.Sprintf("Failed to decode event data: %s", err)
				break
			}

			if len(eventData.Items) == 0 {
				errorString = "'items' field empty"
			}
			
			for _, item := range eventData.Items {
				if item.ID == "" {
					errorString = "Item missing 'itemID' field"
					break eventHandler // Break out of parent switch statement
				}
				if len(item.Updated) == 0 {
					errorString = "Item 'updated' field missing/empty"
					break eventHandler
				}

				_, err = models.EditListItem(c.hub.database, roomMessage.RoomID, item.ID, item.Updated)
				if err != nil {
					errorString = "Unable to update item in database: " + err.Error()
					break eventHandler 
				}
				log.Printf("UPDATED ITEM %s %+v\n", item.ID, item.Updated)
			}
			
			response = &MessageResponse{
				Event: "itemsUpdated",
				Data: eventData,
			}

		case "deleteItem":
			/*
				Delete ListItem
			*/
			type DeleteItemEvent struct {
				ID string `json:"id"`
			}
			var eventData DeleteItemEvent
			err = json.Unmarshal(roomMessage.Data, &eventData)
			if err := json.Unmarshal(roomMessage.Data, &eventData); err != nil {
				errorString = fmt.Sprintf("Failed to decode event data: %s", err)
				break
			}
			
			if eventData.ID == "" {
				errorString = "Missing 'itemID' field"
				break
			}
			
			err = models.RemoveListItem(c.hub.database, roomMessage.RoomID, eventData.ID)
			if err != nil {
				errorString = fmt.Sprintf("Unable to remove item: %s", err)
				break
			}

			log.Printf("DELETED ITEM %s", eventData.ID)

			response = &MessageResponse{
				Event: "itemDeleted",
				Data: eventData,
			}
		case "updateLayout":
			type UpdateVerticesEvent struct {
				Vertices []models.EditorPoint `json:"vertices"`
			}

			var eventData UpdateVerticesEvent
			err := json.Unmarshal(roomMessage.Data, &eventData)
			if err != nil {
				errorString = "Unable to translate updateVertices event: " + err.Error()
				break
			}

			verts := eventData.Vertices
			updatedVerts := make([]models.EditorPoint, len(verts))
		
			for i := range verts {
				updatedVerts[i] = verts[i]
			}

			vertErr := models.UpdateVertices(c.hub.database, roomMessage.RoomID, updatedVerts)

			if vertErr != nil {
				errorString = "Error updating room layout in database: " + err.Error()
				break
			}

			response = &MessageResponse{
				Event: "updateLayout",
				Data: struct{
					Vertices []models.EditorPoint `json:"vertices"`
				}{
					Vertices: updatedVerts,
				},
			}
		case "cloneRoom":
			type CloneRoomEvent struct {
				Id string `json:"id"`
				Target string `json:"target_id"`
			}

			var eventData CloneRoomEvent
			err := json.Unmarshal(roomMessage.Data, &eventData)

			if err != nil {
				errorString = "Unable to translate cloneRooms event: " + err.Error()
				break
			}

			room, copyErr := models.CopyList(c.hub.database, eventData.Id, eventData.Target)

			if copyErr != nil {
				errorString = "Unable to copy the room: " + err.Error()
				break
			}

			response = &MessageResponse{
				Event: "cloneRoom",
				Data: struct{
					Items []models.ListItem `json:"items"`
					Vertices []models.EditorPoint `json:"vertices"`
				}{
					Items: room.Items,
					Vertices: room.Vertices,
				},
			}
		default:
			errorString = fmt.Sprintf("Unknown event '%s'", roomMessage.Event)
		}
	}

	includeOtherClients := true

	if (errorString != "") {
		log.Printf("ERROR: %s", errorString)

		var action string
		if roomMessage.Event == "" {
			action = "unknown"
		} else {
			action = roomMessage.Event
		}

		// Create an error response
		response = &MessageResponse{
			Event: "actionFailed",
			Data: struct{
				Action string `json:"action"`
				Message string `json:"message"`
			}{
				Action: action,
				Message: errorString,
			},
		}
		// Send error message back to sender, but not other clients in room
		includeOtherClients = false
		roomMessage.SendResponse = true
	}

	if response == nil {
		return nil, errors.New("Unable to create response message, response is nil for event: " + roomMessage.Event)
	}

	responseBytes, responseBytesErr := json.Marshal(*response)
	if responseBytesErr != nil {
		return nil, responseBytesErr
	}

	return &Message{ room: roomMessage.RoomID, includeSender: roomMessage.SendResponse, includeOtherClients: includeOtherClients, sender: c, response: responseBytes }, nil
}