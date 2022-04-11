const { Router } = require("express");
let Item = require("../models/item.model");
let Room = require("../models/room.model");

// Need to wrap routes in this function in order for async execptions to be handled automatically
// See: https://github.com/Abazhenov/express-async-handler#readme
const asyncHandler = require("express-async-handler");

import Joi from "joi";
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
  name: Joi.string().min(1).max(Room.MAX_NAME_LENGTH).optional(),
  templateId: Joi.string().min(1).optional(),
});
router.post(
  "/create",
  asyncHandler(async (req, res, next) => {
    validateWithSchema(req.body, createRoomSchema);

    const name = req.body.name;
    const room = await Room.create(name, req.body.templateId);

    res.json(room);
  })
);

module.exports = router;
