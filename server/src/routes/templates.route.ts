import { Router } from "express";
import {RoomService} from "../services/room.service";

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
      const err = new Error("'id' is null or undefined");
      err.status = 400;
      throw err;
    }
    const template = await Room.getFromTemplateId(id);

    res.json(template);
  })
);

module.exports = router;
