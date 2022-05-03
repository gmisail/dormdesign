import Joi from "joi";
import { Router } from "express";

import { RoomService } from "../services/room.service";
import { MAX_NAME_LENGTH } from "../constants/room.constants";

// Need to wrap routes in this function in order for async exceptions to be handled automatically
// See: https://github.com/Abazhenov/express-async-handler#readme
const asyncHandler = require("express-async-handler");

const { validateWithSchema } = require("../utils.js");

const router = Router();

const getRoomSchema = Joi.object({
  id: Joi.string().min(1).required(),
});
router.get(
  "/get",
  asyncHandler(async (req, res) => {
    validateWithSchema(req.query, getRoomSchema);

    const id = req.query.id as string;

    let room = await RoomService.getRoom(id);

    res.json(room);
  })
);

const createRoomSchema = Joi.object({
  name: Joi.string().min(1).max(MAX_NAME_LENGTH).optional(),
  templateId: Joi.string().min(1).optional(),
});
router.post(
  "/create",
  asyncHandler(async (req, res, next) => {
    validateWithSchema(req.body, createRoomSchema);

    const name = req.body.name as string;
    const room = await RoomService.createRoom(name, req.body.templateId);

    res.json(room);
  })
);

module.exports = router;
