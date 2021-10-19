const express = require("express");
const ws = require("ws");
const http = require("http");

const hub = require("./hub");
const database = require("./db");

let Server = {};

Server.setup = async function (app, port) {
  console.log("Starting DormDesign Server");

  const server = http.createServer(app);

  this.sockets = new ws.Server({ clientTracking: false, noServer: true });

  server.on("upgrade", (request, socket, head) => {
    this.sockets.handleUpgrade(request, socket, head, (ws) => {
      this.sockets.emit("connection", ws, request);
    });
  });

  await database.setup();
  hub.setup(this.sockets);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(express.static("public"));
  app.use("/api/room", require("./routes/room"));
  app.use("/api/preview", require("./routes/preview"));

  // Set all other undefined routes to throw an error
  app.get("*", (req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;

    next(error);
  });

  app.use((error, req, res, next) => {
    if (!error.status) error.status = 500;
    // Don't return actual error message to client for internal server errors
    if (error.status === 500) {
      // Log internal server errors to console (since they usually mean something went wrong)
      console.error(error.message);

      error.message = "Internal server error";
    }

    return res
      .status(error.status)
      .json({ error: error.message ?? "Unkown error" });
  });

  server.listen(port, () => console.log("Listening on localhost:" + port));
};

module.exports = Server;
