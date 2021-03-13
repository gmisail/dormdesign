const { v4: uuidv4 } = require('uuid');
const events = require('events');
const chalk = require('chalk');
const querystring = require('querystring');

const USE_DEBUGGER = true;  // print contents of every room for every ping
const PONG_TIME = 5000;    // check every 30 seconds

let Hub = {};
Hub.connections = new Map();
Hub.rooms = new Map();

/*
    If room does not exist, create it. If it does,
    just add it to the room.
*/
Hub.addClient = function(data) 
{
    const { id, room } = data;

    console.log(chalk.greenBright(`Client ${id} has connected to room ${room}.`));

    if(!Hub.rooms.has(room))
    {
        Hub.rooms.set(room, new Map());
    }
    
    Hub.rooms.get(room).set(id, true);
    Hub.connections.get(id).room = room;
}

/*
    Remove client, and if it is the last client in a room,
    delete the room too.
*/
Hub.removeClient = function(id, room)
{
    console.log(chalk.red(`Client ${id} has disconnected from room ${room}.`));
 
    if(Hub.rooms.get(room) === undefined)
    {
        Hub.connections.delete(id);
        return;
    }

    Hub.rooms.get(room).delete(id);

    if(Hub.rooms.get(room).size <= 0)
    {
        Hub.rooms.delete(room);
        console.log(chalk.red(`Deleting room ${room}.`));
    }

    Hub.connections.delete(id);
}

Hub.send = function(id, room, data)
{
    if(!Hub.rooms.has(room))
    {
        return;
    }

    Hub.rooms.get(room).forEach((state, client) => {
        let socket = Hub.connections[client];

        if(client !== id)
        {
            socket.send(JSON.stringify(data));
        }
    });
}

/*
    Called every PONG_TIME milliseconds. This is to check if
    every socket is still alive. If not, then remove the client.
*/
Hub.onPing = function()
{
    for (let [id, socket] of Hub.connections) 
    {
        /*
            If inactive:
                - remove the client from the current room
                - terminate the socket connection
        */
        if(!socket.active)
        {
            Hub.removeClient(socket.id, socket.room);
            return socket.terminate();
        }

        socket.active = false;
        socket.ping(() => {});        
    }
   
    if(!USE_DEBUGGER)
        return;

    if(Hub.rooms.size > 0) 
    {
        console.log(chalk.bgGray("============== Rooms  =============="));
    
        Hub.rooms.forEach((clients, room) => {
            console.log(chalk.blue(room));
        });
    }
}

/*
    Called when socket is initially connected. Used for setting
    up the socket events.
*/
Hub.onConnection = function(socket, req) 
{
    const id = uuidv4();
    const url = req.url;
    const params = querystring.parse(url);
    
    /*
        Add the id, room, and active properties to the socket object so that
        it's easier to look up which room this socket needs to send data to.
    */
    Hub.connections.set(id, socket);
    socket.id = id;
    socket.room = params["/ws?id"];
    socket.active = true;

    Hub.addClient(socket);

    socket.on('pong', function onPing(){
        socket.active = true;
    });

    socket.on('close', () => {
        Hub.removeClient(socket.id, socket.room);
    });
    
    socket.on('message', (msg) => {
        const res = JSON.parse(msg);
        const { room, event, data } = res;

        // emit the event with the data that was sent to the server & the socket's id
        Hub.events.emit(event, { id: socket.id, ...data });
    });
}

Hub.setup = function(sockets)
{
    console.log("Starting socket server");

    Hub.sockets = sockets;
    Hub.events = new events.EventEmitter();

    Hub.events.addListener("joinRoom", Hub.addClient);

    sockets.on('connection', Hub.onConnection);

    const interval = setInterval(Hub.onPing, PONG_TIME);
}

module.exports = Hub;