const { Router } = require("express");
const Room = require("../models/room.model");
const Preview = require("../models/preview.model");
const PreviewRenderer = require("../services/preview-renderer");

let router = Router();

/*
  {
    ids: [ room_id ]
  }
*/
router.post("/", async (req, res) => {
  const ids = req.body;

  if (ids === undefined || ids.length <= 0) {
    throw new Error("Missing room ID parameter for /preview route.");
  }

  const previews = await Promise.all(ids.map(async (id) => {
    const room = await Room.get(id);
    if (!room) {
      return null;
    }
    
    const roomPreview = await Preview.get(room);
    return roomPreview;
  }));

  console.log(previews)

  res.json({
    urls: previews
  });
});

module.exports = router;
