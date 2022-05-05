import Joi from "joi";

const PositionSchema = Joi.object({
    x: Joi.number().precision(4).min(-50).max(50).default(0),
    y: Joi.number().precision(4).min(-50).max(50).default(0)
});

export { PositionSchema };