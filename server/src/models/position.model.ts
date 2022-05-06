import Joi from "joi";

/**
 * Represents a 2D coordinate.
 */
type Position = {
  x: number;
  y: number;
};

const PositionSchema = Joi.object({
  x: Joi.number().precision(4).min(-50).max(50).default(0),
  y: Joi.number().precision(4).min(-50).max(50).default(0),
});

export { Position, PositionSchema };
