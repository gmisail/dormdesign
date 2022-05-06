import { RoomService } from "../services/room.service";
import { Router } from "express";
import { StatusError } from "../errors/status.error";

const asyncHandler = require("express-async-handler");
const router = Router();

router.get(
  "/featured",
  asyncHandler(async (req, res) => {
    const templates = await RoomService.getFeaturedRooms();
    return res.json({ templates });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (id === null || id === undefined) {
      throw new StatusError("'id' is null or undefined", 400);
    }
    const template = await RoomService.getTemplate(id);

    res.json(template);
  })
);

module.exports = router;
