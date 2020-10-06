package main

import (
	"log"
	"github.com/gorilla/websocket"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

type Sockets struct {
	Upgrader websocket.Upgrader
	Rooms map[string]Room
}

/*
	Represents the users working on a single room
*/
type Room struct {
	Clients map[*websocket.Conn]*Client
}

/*
	Data type for each user, contains the outgoing message channel
*/
type Client struct {
	Channel chan []byte
}

/*
	Add client to specified room
*/
func (s *Sockets) AddClient(id string, socket *websocket.Conn) {
	s.Rooms[id][socket] = &Client{ Channel: make(chan *Message) }
}

/*
	Remove client from specified room
*/
func (s *Sockets) RemoveClient(id string, socket *websocket.Conn) {
	delete(s.Rooms[id][socket])
}

/*
	Remove the room and each of its clients, if they exist
*/
func (s *Sockets) RemoveRoom(id string) {
	if len(s.Rooms[id] > 0) {
		for socket, client := range s.Rooms[id] {
			s.RemoveClient(id, socket)
		}
	}

	delete(s.Rooms[id])
}

/*
	Send data to a client within a room
*/
func (s *Sockets) SendToClient(id string, socket *websocket.Conn, data []byte) {
	s.Rooms[id][socket].Channel <- data
}

/*
	Send data to each of the users in a room
*/
func (s *Sockets) SendToRoom(id string, data []byte) {
	if len(s.Rooms[id] > 0) {
		for socket, client := range s.Rooms[id] {
			s.SendToClient(id, socket, data)
		}
	}
}


func (s *Sockets) Handler(c echo.Context) {
	ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	
	if err != nil {
    	log.Fatal(err)
	}
	
	defer ws.Close()

	// add client to room
}

