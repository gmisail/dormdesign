import Joi from "joi";
import { PositionSchema } from "./position.model";

/**
 * Represents an Item object. Validated using Joi schemas to ensure that
 * the data is correct.
 */
type Item = {
  name: string;
  quantity: number;
  visibleInEditor: boolean;
  claimedBy: string;
  dimensions: {
    width: number;
    height: number;
    length: number;
  };
  editorPosition: {
    x: number;
    y: number;
  };
  editorZIndex: number;
  editorRotation: number;
  editorLocked: boolean;
};

const DimensionsSchema = Joi.object({
  width: Joi.number().allow(null).default(null).max(100).min(0),
  height: Joi.number().allow(null).default(null).max(100).min(0),
  length: Joi.number().allow(null).default(null).max(100).min(0),
});

const itemSchema = {
  name: Joi.string().min(1).max(30),
  quantity: Joi.number().integer(),
  visibleInEditor: Joi.boolean(),
  claimedBy: Joi.string().max(30).min(1).allow(null),
  dimensions: DimensionsSchema,
  editorPosition: PositionSchema,
  editorZIndex: Joi.number().integer(),
  editorRotation: Joi.number().precision(4).max(360),
  editorLocked: Joi.boolean(),
};

const createItemSchema = Joi.object({
  ...itemSchema,
  name: itemSchema.name.required(),
  quantity: itemSchema.quantity.default(1),
  visibleInEditor: itemSchema.visibleInEditor.default(false),
  claimedBy: itemSchema.claimedBy.default(null),
  editorPosition: itemSchema.editorPosition.default(),
  editorZIndex: itemSchema.editorZIndex.default(0),
  editorRotation: itemSchema.editorRotation.default(0),
  editorLocked: itemSchema.editorLocked.default(false),
  dimensions: itemSchema.dimensions.default(),
});

const updateItemSchema = Joi.object(itemSchema);

const ItemListSchema = Joi.array().items(itemSchema);

export { createItemSchema, updateItemSchema, itemSchema, ItemListSchema, Item };
