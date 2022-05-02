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

module.exports = router;
