import DormItem from "../models/DormItem";
import RoomEditorData from "../models/RoomEditorData";

let TEST_ID_COUNTER = 600;
var TEST_ITEMS_DATA = [
  {
    id: TEST_ID_COUNTER++,
    name: "Fridge",
    quantity: 4,
    includeInEditor: true,
  },
  {
    id: TEST_ID_COUNTER++,
    name: "Soundbar",
    quantity: 1,
    claimedBy: "John Smith",
    includeInEditor: false,
  },
  {
    id: TEST_ID_COUNTER++,
    name: "Microwave",
    quantity: 100,
    width: 10,
    length: 4,
    height: 2.5,
    includeInEditor: true,
  },
];

var TEST_EDITOR_DATA = {
  objects: [
    { id: 600, position: { x: 1, y: 2 } },
    { id: 602, position: { x: 5, y: 2 } },
  ],
};

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

  /* 
    Gets editor data from server
  */
  static async GET_TEST_EDITOR_DATA() {
    return new RoomEditorData(TEST_EDITOR_DATA);
  }
}

export default DataController;
