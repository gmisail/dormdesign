const express = require('express');
const ws = require("ws");
const http = require('http');

const hub = require('./hub');
const database = require('./db');

let Server = {};

Server.setup = function(app, port) 
{
    console.log("setup server")

    const server = http.createServer(app);

    this.sockets = new ws.Server({ clientTracking: false, noServer: true });   
     
    server.on('upgrade', (request, socket, head) => {  
        this.sockets.handleUpgrade(request, socket, head, (ws) => {
            this.sockets.emit('connection', ws, request);
        });
    });

    database.connect();

    hub.setup(this.sockets);

    app.use(express.static('public'));
    app.use('/room', require('./routes/room'));

    server.listen(port, () => console.log("Listening on localhost:" + port));
}

module.exports = Server;