import { Hub } from "./hub";
import { StatusError } from "./errors/status.error";
import express from "express";
import ws from "ws";

const http = require("http");

const database = require("./db");

class Server {
  app: express.Application;
  port: number;

  constructor(app: express.Application, port: number) {
    this.app = app;
    this.port = port;
  }

  async setup() {
    const server = http.createServer(app);
    const sockets = new ws.Server({ clientTracking: false, noServer: true });

    server.on("upgrade", (request, socket, head) => {
      sockets.handleUpgrade(request, socket, head, (ws) => sockets.emit("connection", ws, request));
    });

    await database.setup();

    let hub = new Hub(sockets);

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static("public"));

    app.use("/api/room", require("./routes/room.route"));
    app.use("/api/preview", require("./routes/preview.route"));
    app.use("/api/templates", require("./routes/templates.route"));

    // Set all other undefined routes to throw an error
    app.get("*", (req, res, next) => next(new StatusError("Not found", 404)));

    app.use((error, req, res, next) => {
      if (!error.status) error.status = 500;

      // Don't return actual error message to client for internal server errors
      if (error.status === 500) {
        // Log internal server errors to console (since they usually mean something went wrong)
        console.error(error);

        error.message = "Internal server error";
      }

      return res.status(error.status).json({ message: error.message ?? "Unknown error" });
    });

    server.listen(port, () => console.log("Listening on localhost:" + port));
  }
}

export { Server };
