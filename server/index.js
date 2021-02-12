const express = require("express");
const app = express();

const port = 5050;

let server = require('./server');

server.setup(app, port);

