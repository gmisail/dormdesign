const express = require("express");
const app = express();

/* load .env into process.env */
require('dotenv').config();

const port = 5500;

let server = require('./server');

server.setup(app, port);

