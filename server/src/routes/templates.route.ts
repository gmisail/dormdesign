import { Router } from "express";

const Room = require("../models/room.model");
const asyncHandler = require("express-async-handler");
const router = Router();

router.get(
  "/featured",
  asyncHandler(async (req, res) => {
    const templates = await Room.getFeatured();

    return res.json({ templates });
  })
);

module.exports = router;
