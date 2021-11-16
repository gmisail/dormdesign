const { createItemSchema, updateItemSchema } = require("../schemas/item.schema");
const { validateWithSchema } = require("../utils.js");
const { v4: uuidv4 } = require("uuid");

let Item = {};

/**
 * Create an item based off of the given parameters & initialize each of the other parameters to their default values
 * @param { object } item
 * @returns Valid item
 * @throws When item is invalid
 */
Item.create = (item) => {
  validated = validateWithSchema(item, createItemSchema);
  validated.id = uuidv4();
  return validated;
};

/**
 * Apply given update to given item.
 * @param { object } item Item to update
 * @param { object } update Update to apply to item
 * @throws When update is invalid
 */
Item.update = (item, update) => {
  update = validateWithSchema(update, updateItemSchema);
  Object.assign(item, update);
};

module.exports = Item;
