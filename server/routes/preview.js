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
router.get("/", async (req, res) => {
  const ids = req.query.ids;

  if (ids === undefined || ids.length <= 0) {
    throw new Error("Missing room ID parameter for /preview route.");
  }

  const previews = ids.map(async (id) => {
    const room = await Room.get(id);
    if (!room) {
      return null;
    }
    
    return await Preview.get(room);
  });

  res.json({
    urls: previews
  });
});

module.exports = router;
