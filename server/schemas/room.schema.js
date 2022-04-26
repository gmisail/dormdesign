const Joi = require("joi");

const dimensionsSchema = Joi.object({
  width: Joi.number().precision(3).max(100).min(0).allow(null).default(null),
  height: Joi.number().precision(3).max(100).min(0).allow(null).default(null),
  length: Joi.number().precision(3).max(100).min(0).allow(null).default(null),
});

const editorPositionSchema = Joi.object({
  x: Joi.number().precision(4).min(-50).max(50).default(0),
  y: Joi.number().precision(4).min(-50).max(50).default(0),
});

const itemFields = {
  name: Joi.string().min(1).max(30),
  quantity: Joi.number().integer(),
  visibleInEditor: Joi.boolean(),
  claimedBy: Joi.string().max(30).min(1).allow(null),
  dimensions: dimensionsSchema,
  editorPosition: editorPositionSchema,
  editorZIndex: Joi.number().integer(),
  editorRotation: Joi.number().precision(4).max(360),
  editorLocked: Joi.boolean(),
};
const itemSchema = Joi.object({
  ...itemFields,
  name: itemFields.name.required(),
  quantity: itemFields.quantity.required(),
  visibleInEditor: itemFields.visibleInEditor.required(),
  claimedBy: itemFields.claimedBy.required(),
  editorPosition: itemFields.editorPosition.required(),
  editorZIndex: itemFields.editorZIndex.required(),
  editorRotation: itemFields.editorRotation.required(),
  editorLocked: itemFields.editorLocked.required(),
  dimensions: itemFields.dimensions.required(),
});

const updateItemSchema = Joi.object(itemFields);

const createItemSchema = Joi.object({
  ...itemFields,
  name: itemFields.name.required(),
  quantity: itemFields.quantity.default(1),
  visibleInEditor: itemFields.visibleInEditor.default(false),
  claimedBy: itemFields.claimedBy.default(null),
  editorPosition: itemFields.editorPosition.default(),
  editorZIndex: itemFields.editorZIndex.default(0),
  editorRotation: itemFields.editorRotation.default(0),
  editorLocked: itemFields.editorLocked.default(false),
  dimensions: itemFields.dimensions.default(),
});

const roomDataFields = {
  name: Joi.string().min(1).max(40),
  vertices: Joi.array().min(3).items(editorPositionSchema),
  items: Joi.array().items(itemSchema),
};
// updateRoomData doesn't include the items array here. Item updates are handled separately from room updates in the Hub
const updateRoomDataSchema = Joi.object({
  name: roomDataFields.name,
  // There must be at least 3 vertices in the room
  vertices: roomDataFields.vertices,
});

module.exports = {
  itemFields,
  itemSchema,
  createItemSchema,
  updateItemSchema,
  updateRoomDataSchema,
  roomDataFields,
};
