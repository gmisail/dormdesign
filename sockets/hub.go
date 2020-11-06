package sockets

import (
	rdb "gopkg.in/rethinkdb/rethinkdb-go.v6"
)

type Message struct {
	room string
	includeSender bool
	includeOtherClients bool
	sender *Client
	response []byte
}
type MessageResponse struct {
	Event string `json:"event"`
	Data interface{} `json:"data"`
}

type Room struct {
	Clients map[*Client]bool
}

type Hub struct {
	database *rdb.Session
	rooms map[string]*Room
	broadcast chan Message
	register chan *Client
	unregister chan *Client
}

func CreateHub(database *rdb.Session) *Hub {
	return &Hub{
		database: database,
		broadcast: make(chan Message),
		register: make(chan *Client),
		unregister: make(chan *Client),
		rooms: make(map[string]*Room),
	}
}

/*
	Add client to specified room
*/
func (h *Hub) AddClient(id string, client *Client) {
	room := h.rooms[id]

	if room == nil {
		room = &Room{ Clients: make(map[*Client]bool) }
		h.rooms[id] = room
	}

	room.Clients[client] = true 
}

/*
	Remove client from specified room
*/
func (h *Hub) RemoveClient(id string, client *Client) {	
	room := h.rooms[id]
	
	if room != nil {
		delete(room.Clients, client)
		close(client.send)
		
		if len(room.Clients) == 0 {
			h.RemoveRoom(id)
		}
	}
}

/*
	Remove the room and each of its clients, if they exist
*/
func (h *Hub) RemoveRoom(id string) {
	delete(h.rooms, id)
}

func (h *Hub) Send(message Message) {
	h.broadcast <- message
}

/*
	"Listen" for events that come into the hub
*/
func (h *Hub) Run() {
	for {
		select {
		case client := <- h.register:
			h.AddClient(client.id, client)
		case client := <- h.unregister:
			h.RemoveClient(client.id, client)
		case message := <- h.broadcast:
			room := h.rooms[message.room]

			if room != nil {
				// Send message to all clients in the room
				for client := range room.Clients {
					// If includeSender flag, send message back to client that originally sent it
					if (!message.includeSender && client == message.sender) {
						continue
					}
					select {
					case client.send <- message.response:
					default:
						h.RemoveClient(client.id, client)
					}
				}
			}
		}
	}
}