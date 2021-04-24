const { Router } = require("express");
const Room = require("../models/room.model");
const PreviewRenderer = require("../services/preview-renderer");

let router = Router();

router.get("/", async (req, res) => {
    const id = req.query.id;
  
    if (id === undefined || id.length <= 0) {
      throw new Error("Missing room ID parameter for /preview route.");
    }
  
    const room = await Room.get(id);
    const previewUrl = PreviewRenderer.generatePreview(room);

    res.json({
        url: previewUrl
    });
  });

module.exports = router;