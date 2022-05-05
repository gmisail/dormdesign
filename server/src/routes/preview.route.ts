import { Router } from "express";
import { StatusError } from "../errors/status.error";
import { PreviewService } from "../services/preview.service";
import { RoomService } from "../services/room.service";

// Need to wrap routes in this function in order for async exceptions to be handled automatically
// See: https://github.com/Abazhenov/express-async-handler#readme
const asyncHandler = require("express-async-handler");

let router = Router();

/**
 * Attempts to generate a preview of the room represented by the given id.
 * @param { string } id
 * @param { boolean } isTemplate Set to true if the  given id is a templateId
 * @returns Preview data if successful, otherwise null
 */
const generateRoomPreview = async (id: string, isTemplate: boolean = false): Promise<string> => {
  const room = isTemplate ? await RoomService.getFromTemplateId(id) : await RoomService.getRoom(id);
  const roomPreview = await PreviewService.generatePreview(room);
  return roomPreview !== null ? roomPreview.data : null;
};

router.get(
  "/room/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;

    if (id === null || id === undefined) {
      throw new StatusError("'id' is null or undefined", 400);
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
      throw new StatusError("'id' is null or undefined", 400);
    }

    const preview = await generateRoomPreview(id, true);

    res.json({ preview });
  })
);

module.exports = router;
