const { Router } = require("express");
let Item = require("../models/item.model");
let Room = require("../models/room.model");
const Users = require("../models/users.model");

// Need to wrap routes in this function in order for async execptions to be handled automatically
// See: https://github.com/Abazhenov/express-async-handler#readme
const asyncHandler = require("express-async-handler");

const Joi = require("joi");
const { validateWithSchema } = require("../utils.js");

const router = Router();

const getRoomSchema = Joi.object({
  id: Joi.string().min(1).required(),
});
router.get(
  "/get",
  asyncHandler(async (req, res) => {
    validateWithSchema(req.query, getRoomSchema);
    const id = req.query.id;

    let room = await Room.get(id);

    res.json(room);
  })
);

const createRoomSchema = Joi.object({
  name: Joi.string().min(1).max(30).required(),
});
router.post(
  "/create",
  asyncHandler(async (req, res, next) => {
    validateWithSchema(req.body, createRoomSchema);

    const name = req.body.name;

    if (name === undefined || name.length <= 0) {
      const err = new Error("Missing room name parameter.");
      err.status = 400;
      throw err;
    }
    if (name.length > Room.MAX_NAME_LENGTH) {
      const err = new Error(
        `Room name exceeds maximum allowed length of ${Room.MAX_NAME_LENGTH} characters`
      );
      err.status = 400;
      next(err);
    }

    const room = await Room.create(name);

    res.json(room);
  })
);

module.exports = router;
