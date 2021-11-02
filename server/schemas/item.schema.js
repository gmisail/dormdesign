const Joi = require("joi");

const dimensionsSchema = Joi.object({
  width: Joi.number().allow(null).default(null),
  height: Joi.number().allow(null).default(null),
  length: Joi.number().allow(null).default(null),
});

const editorPositionSchema = Joi.object({
  x: Joi.number().precision(4).default(0),
  y: Joi.number().precision(4).default(0),
});

const itemSchema = {
  name: Joi.string().min(1).max(30),
  quantity: Joi.number().integer(),
  visibleInEditor: Joi.boolean(),
  dimensions: dimensionsSchema,
  editorPosition: editorPositionSchema,
  editorZIndex: Joi.number().integer(),
  editorRotation: Joi.number().precision(4),
  editorLocked: Joi.boolean(),
};

const createItemSchema = Joi.object({
  ...itemSchema,
  name: itemSchema.name.required(),
  quantity: itemSchema.quantity.default(1),
  visibleInEditor: itemSchema.visibleInEditor.default(false),
  editorPosition: itemSchema.editorPosition.default(),
  editorZIndex: itemSchema.editorZIndex.default(0),
  editorRotation: itemSchema.editorRotation.default(0),
  editorLocked: itemSchema.editorLocked.default(false),
  dimensions: itemSchema.dimensions.default(),
});

const updateItemSchema = Joi.object({
  ...itemSchema,
});

module.exports = { createItemSchema, updateItemSchema };
