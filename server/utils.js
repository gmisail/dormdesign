const Joi = require("joi");

/**
 * Validates the given request body using the given Joi schema. Throws an error with Joi message if invalid.
 * @param {string} body request body to validate
 * @param {Joi.ObjectSchema} schema schema to validate body with
 * @throws {Error} when body is invalid
 */
const validateWithSchema = (body, schema) => {
  const { error } = schema.validate(body);
  if (error) {
    const err = new Error(error.details[0].message);
    err.status = 400;
    throw err;
  }
};

module.exports = { validateWithSchema };
