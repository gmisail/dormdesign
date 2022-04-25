const { Router } = require("express");
let Room = require("../models/room.model");

// Need to wrap routes in this function in order for async execptions to be handled automatically
// See: https://github.com/Abazhenov/express-async-handler#readme
const asyncHandler = require("express-async-handler");

const Joi = require("joi");
const { validateWithSchema } = require("../utils.js");

const { roomDataFields } = require("../schemas/room.schema");

const router = Router();

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (id === null || id === undefined) {
      const err = new Error("'id' is null or undefined");
      err.status = 400;
      throw err;
    }
    let room = await Room.get(id);

    res.json(room);
  })
);

const createRoomSchema = Joi.object({
  name: roomDataFields.name.optional(),
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
