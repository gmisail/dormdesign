const Joi = require("joi");

/**
 * Validates the given object using the given Joi schema and returns the validated object. Throws a 400 error with Joi message if invalid.
 * @param {any} body object to validate
 * @param {Joi.ObjectSchema} schema schema to validate body with
 * @throws {Error} when body is invalid
 * @returns {any} Validated object
 */
const validateWithSchema = (obj, schema) => {
  // stripUnknown removes unknown fields from obj
  const { error, value } = schema.validate(obj, { stripUnknown: true });
  if (error) {
    const err = new Error("Invalid schema: " + error.details[0].message);
    err.status = 400;
    throw err;
  }
  return value;
};

module.exports = { validateWithSchema };
