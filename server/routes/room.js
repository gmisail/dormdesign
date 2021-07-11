const { Router } = require("express");
let Item = require("../models/item.model");
let Room = require("../models/room.model");
const Users = require("../models/users.model");

const router = Router();

router.get("/get", async (req, res) => {
  const id = req.query.id;

  if (id === undefined || id.length <= 0) {
    throw new Error("Missing room ID parameter for route 'get'.");
  }

  let room = await Room.get(id);

  res.json(room);
});

router.get("/clone", (req, res) => {
  const id = req.query.id;

  if (id === undefined || id.length <= 0) {
    throw new Error("Missing room ID parameter for route 'clone'.");
  }

  res.json({});
});

router.post("/create", async (req, res) => {
  const name = req.body.name;

  if (name === undefined || name.length <= 0) {
    throw new Error("Missing room name parameter.");
  }
  if (name.length > Room.MAX_NAME_LENGTH) {
    throw new Error(
      `Room name exceeds maximum allowed length of ${Room.MAX_NAME_LENGTH} characters`
    );
  }

  const room = await Room.create(name);

  res.json(room);
});

module.exports = router;
