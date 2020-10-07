import DormItem from "../models/DormItem";

let TEST_ID_COUNTER = 600;
var TEST_ITEMS = [
  new DormItem({
    id: TEST_ID_COUNTER++,
    name: "Fridge",
    quantity: 4,
    includeInEditor: true,
  }),
  new DormItem({
    id: TEST_ID_COUNTER++,
    name: "Soundbar",
    quantity: 1,
    claimedBy: "John Smith",
    includeInEditor: false,
  }),
  new DormItem({
    id: TEST_ID_COUNTER++,
    name: "Microwave",
    quantity: 100,
    width: 10,
    length: 4,
    height: 2.5,
    includeInEditor: true,
  }),
];

/**
 *  List creation / modification handler.
 */
class ListController {
  /*
        Retrieves the List's data from the server.
    */
  static getList(done) {
    // as of now, just pass the static data to the callback.
    done(TEST_ITEMS);
  }

  /*
        Pushes a new item to the list, passes the resulting back in the callback
    */
  static addListItem(item, done) {
    item.id = TEST_ID_COUNTER++;

    if (item.name.length === 0) {
      item.name = "New Item";
    }

    TEST_ITEMS.push(item);

    done(TEST_ITEMS);
  }

  /*
        Modifies the properties of a list item and returns the resulting list as a callback
    */
  static editListItem(item, done) {
    done(item);
  }

  /*
        Removes a item from the list
    */
  static removeListItem(item, done) {
    done(item);
  }
}

export default ListController;
