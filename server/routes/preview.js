const { Router } = require("express");
const Room = require("../models/room.model");
const Preview = require("../models/preview.model");
const PreviewRenderer = require("../services/preview-renderer");

let router = Router();

/**
 *  Accepts an array of room ID's an returns an array of the same length where
 *  each element is either the preview URI or null (if the operation failed for
 *  that room)
 */
router.post("/", async (req, res) => {
  const ids = req.body;

  if (ids === undefined || ids.length <= 0) {
    throw new Error("Missing room ID parameter for /preview route.");
  }

  /*
    Since each render is asynchronous, we need to wait for 
    all of them to finish before sending them over. 
  */
  const previews = await Promise.all(
    ids.map(async (id) => {
      const room = await Room.get(id);
      if (!room) {
        return null;
      }

      const roomPreview = await Preview.get(room);
      return roomPreview;
    })
  );

  res.json({ previews });
});

module.exports = router;
