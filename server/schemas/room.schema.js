const Joi = require("joi");

/**
 * Schema for item dimensions
 */
const dimensionsSchema = Joi.object({
  width: Joi.number().precision(3).max(100).min(0).allow(null).default(null),
  height: Joi.number().precision(3).max(100).min(0).allow(null).default(null),
  length: Joi.number().precision(3).max(100).min(0).allow(null).default(null),
});

/**
 * Schema for points in the room editor (e.g. item positions, boundary positions, etc.)
 */
const editorPositionSchema = Joi.object({
  x: Joi.number().precision(4).min(-50).max(50).default(0),
  y: Joi.number().precision(4).min(-50).max(50).default(0),
});

/**
 * Contains item Joi objects (can be used to validate individual fields of item)
 */
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

/**
 * Schema for validating existing items
 */
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

/**
 * Schema for item updates
 */
const updateItemSchema = Joi.object(itemFields);

/**
 * Schema for item creations
 */
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

/**
 * Contains room.data Joi objects (can be used to validate individual fields of room.data)
 */
const roomDataFields = {
  name: Joi.string().min(1).max(40),
  vertices: Joi.array().min(3).items(editorPositionSchema),
  items: Joi.array().items(itemSchema),
};

/**
 * Schema for room.data updates
 *
 * Doesn't include the items array. Item updates are currently handled separately in the Hub
 */
const updateRoomDataSchema = Joi.object({
  name: roomDataFields.name,
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
