const express = require("express");
const app = express();

const port = 8000;

let server = require("./server");

server.setup(app, port);
