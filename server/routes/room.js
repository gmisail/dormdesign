const { Router } = require('express');
let Room = require("../models/roomModel");

const router = Router();

router.get('/get', (req, res) => console.log("got room request"));
router.get('/clone', (req, res) => console.log("got clone request"));
router.post('/create', (req, res) => console.log("got create request"));
router.post('/add', (req, res) => console.log("got add request"));

module.exports = router;