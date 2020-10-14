import DormItem from "../models/DormItem";

let TEST_ID_COUNTER = 600;
const TEST_ITEMS_DATA = [
  {
    id: TEST_ID_COUNTER++,
    name: "Fridge",
    quantity: 4,
    includeInEditor: true,
    editorPosition: { x: 1, y: 2 },
  },
  {
    id: TEST_ID_COUNTER++,
    name: "Soundbar",
    quantity: 1,
    claimedBy: "John Smith",
    includeInEditor: false,
    editorPosition: false,
  },
  {
    id: TEST_ID_COUNTER++,
    name: "Microwave",
    quantity: 100,
    width: 10,
    length: 4,
    height: 2.5,
    includeInEditor: true,
    editorPosition: { x: 5, y: 2 },
  },
];

/**
 *  Data creation / modification handler.
 */
class DataController {
  /*
        Retrieves the List's data from the server.
    */
  static async getItemMap() {
    // as of now, just pass the static data to the callback.
    const itemMap = new Map(
      TEST_ITEMS_DATA.map((item) => [item.id, new DormItem(item)])
    );

    return itemMap;
  }

  /*
        Pushes a new item to the list, passes the resulting item back in the callback
        (with new, server-assigned properties such as id)
    */
  static async addListItem(item) {
    item.id = TEST_ID_COUNTER++;

    if (item.name.length === 0) {
      item.name = "New Item";
    }

    return item;
  }

  /*
        Modifies the properties of a list item and returns the resulting list as a callback
    */
  static async editListItem(item) {
    return item;
  }

  /*
        Removes a item from the list
    */
  static async removeListItem(item) {
    return true;
  }
}

export default DataController;
