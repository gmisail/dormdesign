import Joi from "joi";
import { Position, PositionSchema } from "./position.model";

/**
 * Represents an Item object. Validated using Joi schemas to ensure that
 * the data is correct.
 */
type Item = {
  id: string;
  name: string;
  quantity: number;
  visibleInEditor: boolean;
  claimedBy: string;
  dimensions: {
    width: number;
    height: number;
    length: number;
  };
  editorPosition: Position;
  editorZIndex: number;
  editorRotation: number;
  editorLocked: boolean;
};

const DimensionsSchema = Joi.object({
  width: Joi.number().allow(null).default(null).max(100).min(0),
  height: Joi.number().allow(null).default(null).max(100).min(0),
  length: Joi.number().allow(null).default(null).max(100).min(0),
});

/**
 * Object containing schemas for each individual field of an Item. Note that this object is not a schema itself, just
 * a wrapper around the schemas for each individual field.
 */
const ItemFieldSchemas = {
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

/**
 * Schema for creating a new Item
 */
const CreateItemSchema = Joi.object({
  ...ItemFieldSchemas,
  name: ItemFieldSchemas.name.required(),
  quantity: ItemFieldSchemas.quantity.default(1),
  visibleInEditor: ItemFieldSchemas.visibleInEditor.default(false),
  claimedBy: ItemFieldSchemas.claimedBy.default(null),
  editorPosition: ItemFieldSchemas.editorPosition.default(),
  editorZIndex: ItemFieldSchemas.editorZIndex.default(0),
  editorRotation: ItemFieldSchemas.editorRotation.default(0),
  editorLocked: ItemFieldSchemas.editorLocked.default(false),
  dimensions: ItemFieldSchemas.dimensions.default(),
});

/**
 * Schema for updating an item
 */
const UpdateItemSchema = Joi.object(ItemFieldSchemas);

export { CreateItemSchema, UpdateItemSchema, ItemFieldSchemas, Item };
