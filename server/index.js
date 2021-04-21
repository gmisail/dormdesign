const express = require("express");
const app = express();

/* load .env into process.env */
require("dotenv").config();

const port = 8000;

let server = require("./server");

server.setup(app, port);
