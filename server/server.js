const express = require('express');
const ws = require("ws");
const http = require('http');
const bodyParser = require('body-parser');

const hub = require('./hub');
const database = require('./db');

let Server = {};

Server.setup = async function(app, port) 
{
    console.log("setup server")

    const server = http.createServer(app);

    this.sockets = new ws.Server({ clientTracking: false, noServer: true });   
     
    server.on('upgrade', (request, socket, head) => {  
        this.sockets.handleUpgrade(request, socket, head, (ws) => {
            this.sockets.emit('connection', ws, request);
        });
    });

    await database.setup();
    hub.setup(this.sockets);

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    app.use(express.static('public'));
    app.use('/api/room', require('./routes/room'));

    server.listen(port, () => console.log("Listening on localhost:" + port));
}

module.exports = Server;