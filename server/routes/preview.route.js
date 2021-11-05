const { Router } = require("express");
const Room = require("../models/room.model");
const Preview = require("../models/preview.model");
const PreviewRenderer = require("../services/preview-renderer");

// Need to wrap routes in this function in order for async execptions to be handled automatically
// See: https://github.com/Abazhenov/express-async-handler#readme
const asyncHandler = require("express-async-handler");

const Joi = require("joi");
const { validateWithSchema } = require("../utils.js");

let router = Router();

/**
 *  Accepts an array of room ID's an returns an array of the same length where
 *  each element is either the preview URI or null (if the operation failed for
 *  that room)
 */
const getPreviewsSchema = Joi.array().items(Joi.string()).min(1);
router.post(
  "/",
  asyncHandler(async (req, res) => {
    console.log("BODY", req.body);
    validateWithSchema(req.body, getPreviewsSchema);
    const ids = req.body;

    /*
      Since each render is asynchronous, we need to wait for 
      all of them to finish before sending them over. 
    */
    const previews = await Promise.all(
      ids.map(async (id) => {
        let room;
        try {
          room = await Room.get(id);
        } catch (error) {
          return null;
        }

        const roomPreview = await Preview.get(room);
        return roomPreview;
      })
    );

    res.json({ previews });
  })
);

module.exports = router;
