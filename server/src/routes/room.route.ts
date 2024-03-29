import Joi from "joi";
import { RoomNameSchema } from "../models/room.model";
import { RoomService } from "../services/room.service";
import { Router } from "express";
import { StatusError } from "../errors/status.error";
import { validateWithSchema } from "../utils";

// Need to wrap routes in this function in order for async exceptions to be handled automatically
// See: https://github.com/Abazhenov/express-async-handler#readme
const asyncHandler = require("express-async-handler");

const router = Router();

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;

    if (id === null || id === undefined) {
      throw new StatusError("'id' is null or undefined", 400);
    }

    let room = await RoomService.getRoom(id);

    res.json(room);
  })
);

const createRoomSchema = Joi.object({
  name: RoomNameSchema.optional(),
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
