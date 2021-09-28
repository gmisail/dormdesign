const { Router } = require("express");
const Room = require("../models/room.model");
const Preview = require("../models/preview.model");
const PreviewRenderer = require("../services/preview-renderer");

let router = Router();

router.get("/", async (req, res) => {
  const id = req.query.id;

  if (id === undefined || id.length <= 0) {
    throw new Error("Missing room ID parameter for /preview route.");
  }

  const room = await Room.get(id);

  if (!room) {
    res.json({ message: "Invalid room ID." });
  } else {
    let previewUrl = await Preview.get(room);

    res.json({
      url: previewUrl,
    });
  }
});

module.exports = router;
