import Joi from "joi";

const vertexSchema = Joi.object({
  x: Joi.number().precision(4).default(0),
  y: Joi.number().precision(4).default(0),
});

// This shouldn't include the items array. Items should be updated separately.
// We could allow items to be updated here as well but that would require a lot more complex validation
const updateRoomDataSchema = Joi.object({
  name: Joi.string().min(1).max(40),
  // There must be at least 3 vertices in the room
  vertices: Joi.array().min(3).items(vertexSchema),
});

module.exports = { updateRoomDataSchema };
