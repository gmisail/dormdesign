const { Router } = require('express');
let Item = require('../models/item.model');
let Room = require("../models/room.model");

const router = Router();

router.get('/get', async (req, res) => {
    const id = req.query.id;

    if(id === undefined || id.length <= 0)
    {
        throw new Error("Missing room ID parameter for route 'get'.");
    }

    const room = await Room.get(id);

    res.json(room);
});

router.get('/clone', (req, res) => {
    const id = req.query.id;

    if(id === undefined || id.length <= 0)
    {
        throw new Error("Missing room ID parameter for route 'clone'.");
    }

    res.json({});
});

router.post('/create', async (req, res) => {
    const name = req.query.name;

    if(name === undefined || name.length <= 0)
    {
        throw new Error("Missing room name parameter.");
    }

    const room = await Room.create(name);

    res.json(room);    
});

router.post('/add', (req, res) => console.log("got add request"));

module.exports = router;