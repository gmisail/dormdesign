const { Router } = require("express");
const Room = require("../models/room.model");
const Preview = require("../models/preview.model");

// Need to wrap routes in this function in order for async execptions to be handled automatically
// See: https://github.com/Abazhenov/express-async-handler#readme
const asyncHandler = require("express-async-handler");

let router = Router();

/**
 * Attempts to generate a preview of the room represented by the given id.
 * @param { string } id
 * @param { boolean } isTemplate Set to true if the  given id is a templateId
 * @returns Preview if successful, otherwise null
 */
const generateRoomPreview = async (id, isTemplate = false) => {
  const room = isTemplate ? await Room.getFromTemplateId(id) : await Room.get(id);
  const roomPreview = await Preview.get(room);
  return roomPreview !== null ? roomPreview.data : null;
};

router.get(
  "/room/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (id === null || id === undefined) {
      const err = new Error("'id' is null or undefined");
      err.status = 400;
      throw err;
    }
    const preview = await generateRoomPreview(id, false);

    res.json({ preview });
  })
);

router.get(
  "/template/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (id === null || id === undefined) {
      const err = new Error("'id' is null or undefined");
      err.status = 400;
      throw err;
    }
    const preview = await generateRoomPreview(id, true);

    res.json({ preview });
  })
);

module.exports = router;
