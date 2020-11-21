package sockets;

import (
	"log"
	"encoding/json"
	"errors"
	"io"

	"github.com/gmisail/dormdesign/models"
	"github.com/google/uuid"
	"github.com/mitchellh/mapstructure"
)

type MessageResponse struct {
	Event string `json:"event"`
	Data interface{} `json:"data"`
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

type RoomMessage struct {
	RoomID string `json:"room"`
	Event string `json:"event"`
	SendResponse bool `json:"sendResponse"`
	Data *map[string]interface{} `json:"data"`
}

// Takes in socket reader and returns a pointer to the translated Message object if its valid. Otherwise, returns error.
func (c *Client) translateMessage(reader io.Reader) (*Message, error) {

	var roomMessage RoomMessage
	decoder := json.NewDecoder(reader)
	// Throw an error if there are unknown fields in the message
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&roomMessage); err != nil {
		return nil, err;
	}

	var err error;
	if roomMessage.RoomID == "" {
		err = errors.New("Missing/empty 'room' field")
	}
	if roomMessage.Event == "" {
		err = errors.New("Missing/empty 'event' field")
	}
	if roomMessage.Data == nil {
		err = errors.New("Missing/empty 'data' field")
	}
	if err != nil {
		return nil, err;
	}

	// Set if there's an error handling an event. If set, an error MessageResponse will be generated and returned
	var errorString string
	
	var response *MessageResponse
	response = nil

	// Handle different message events based on value of "event" field in message JSON
	switch roomMessage.Event {
	case "addItem":
		/*
			Create new ListItem model
		*/
		var item models.ListItem
		err := mapstructure.Decode(roomMessage.Data, &item)
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
				ItemID string
				Updated map[string]interface{}
			}
		}

		var eventData UpdatedItemsEvent
		err := mapstructure.Decode(roomMessage.Data, &eventData)

		if err != nil {
			log.Println(err)
		}
		
		for _, item := range eventData.Items {
			_, err = models.EditListItem(c.hub.database, roomMessage.RoomID, item.ItemID, item.Updated)
			if err != nil {
				errorString = "Error updating item in database: " + err.Error()
				break
			}
			log.Printf("UPDATED ITEM %s %+v\n", item.ItemID, item.Updated)
		}
		
		response = &MessageResponse{
			Event: "itemsUpdated",
			Data: eventData,
		}

	case "deleteItem":
		/*
			Delete ListItem
		*/
		// itemID, ok := data["itemID"].(string)
		// if !ok {
		// 	errorString = "Incorrect/missing fields in received event."
		// 	break
		// }
		
		// err = models.RemoveListItem(c.hub.database, roomID, itemID)
		// if err != nil {
		// 	errorString = "Error removing item from list: " + err.Error()
		// 	break
		// }

		// log.Printf("DELETED ITEM %s", itemID)

		// response = &MessageResponse{
		// 	Event: "itemDeleted",
		// 	Data: struct{
		// 		ID string `json:"id"`
		// 	}{
		// 		ID: itemID,
		// 	},
		// }
	default:
		return nil, errors.New("Unknown event: " + roomMessage.Event)
	}

	includeOtherClients := true

	if (errorString != "") {
		log.Printf(errorString)
		response = generateErrorMessageResponse(roomMessage.Event, errorString)
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