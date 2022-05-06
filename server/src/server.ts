import { Cache } from "./cache";
import { Database } from "./db";
import { Hub } from "./hub";
import { StatusError } from "./errors/status.error";
import express from "express";
import http from "http";
import ws from "ws";

class Server {
  app: express.Application;
  port: number;

  constructor(app: express.Application, port: number) {
    this.app = app;
    this.port = port;
  }

  async setup(): Promise<void> {
    const server = http.createServer(this.app);
    const sockets = new ws.Server({ clientTracking: false, noServer: true });

    server.on("upgrade", (request, socket, head) => {
      sockets.handleUpgrade(request, socket, head, (ws) => sockets.emit("connection", ws, request));
    });

    await Cache.connect();
    await Database.connect();

    const hub = new Hub(sockets);

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.static("public"));

    this.app.use("/api/room", require("./routes/room.route"));
    this.app.use("/api/preview", require("./routes/preview.route"));
    this.app.use("/api/template", require("./routes/template.route"));

    // Set all other undefined routes to throw an error
    this.app.get("*", (req, res, next) => next(new StatusError("Not found", 404)));

    this.app.use((error, req, res, next) => {
      if (!error.status) error.status = 500;

      // Don't return actual error message to client for internal server errors
      if (error.status === 500) {
        // Log internal server errors to console (since they usually mean something went wrong)
        console.error(error);

        error.message = "Internal server error";
      }

      return res.status(error.status).json({ message: error.message ?? "Unknown error" });
    });

    server.listen(this.port, () => console.log("Listening on localhost:" + this.port));
  }
}

export { Server };
