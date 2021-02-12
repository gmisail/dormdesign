const express = require('express');
const hub = require('./hub');
const ws = require("ws");
const http = require('http');

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

    hub.setup(this.sockets);

    app.use(express.static('public'));

    app.use('/room', require('./routes/room'));

    server.listen(port, () => console.log("Listening on localhost:" + port));
}

module.exports = Server;