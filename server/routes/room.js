const { Router } = require('express');
let Room = require("../models/roomModel");

const router = Router();

router.get('/get', (req, res) => {
    const id = req.query.id;

    if(id === undefined || id.length <= 0)
    {
        throw new Error("Missing room ID parameter.");
    }

    const room = Room.get(id);

    res.json(room);
});

router.get('/clone', (req, res) => {
    
});

router.post('/create', (req, res) => console.log("got create request"));
router.post('/add', (req, res) => console.log("got add request"));

module.exports = router;