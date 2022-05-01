import { createItemSchema, updateItemSchema, Item } from "../models/item.model";
const { validateWithSchema } = require("../utils.js");
const { v4: uuidv4 } = require("uuid");

/**
 * Item Service manages creating / update Item objects, as well as validating their
 * properties.
 */
class ItemService {
  /**
   * Create an item based off of the given parameters & initialize each of the other parameters to their default values
   * @param { object } item
   * @returns Valid item
   * @throws When item is invalid
   */
  static createItem(item: any): Item {
    let validated = validateWithSchema(item, createItemSchema);
    validated.id = uuidv4();
    return validated;
  }

  /**
   * Apply given update to given item.
   * @param { object } item Item to update
   * @param { object } update Update to apply to item
   * @throws When update is invalid
   */
  static updateItem(item: Item, updates: Item) {
    const validatedUpdates: Item = validateWithSchema(updates, updateItemSchema);
    Object.assign(item, validatedUpdates);
  }
}

export { ItemService };
