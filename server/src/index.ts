import { Server } from "./server";
import express from "express";

const app = express();
const port = 8000;

let server = new Server(app, port);
server.setup();
