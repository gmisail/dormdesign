import DormItem from "../models/DormItem";

// let TEST_ID_COUNTER = 600;
// const TEST_ITEMS_DATA = [
//   {
//     id: TEST_ID_COUNTER++,
//     name: "Fridge",
//     quantity: 4,
//     editable: true,
//     editorPosition: { x: 1, y: 2 },
//   },
//   {
//     id: TEST_ID_COUNTER++,
//     name: "Soundbar",
//     quantity: 1,
//     claimedBy: "John Smith",
//     editable: false,
//     editorPosition: false,
//   },
//   {
//     id: TEST_ID_COUNTER++,
//     name: "Microwave",
//     quantity: 100,
//     width: 10,
//     length: 4,
//     height: 2.5,
//     editable: true,
//     editorPosition: { x: 5, y: 2 },
//   },
// ];

/**
 *  Data creation / modification handler.
 */
class DataController {
  // Creates a new room and returns room ID sent back from server
  static async createRoom() {
    const response = await fetch("/list/create", {
      method: "POST",
    });
    if (!response.ok) {
      const data = await response.json();
      const message = `${response.status} Error creating room: ${data.message}`;
      console.error(message);
    }
    const roomID = await response.json();
    return roomID;
  }

  //Retrieves the List's data from the server.
  static async getList(id) {
    if (!id) {
      throw new Error("Can't fetch room data. Room ID is undefined");
    }

    const response = await fetch(`/list/get?id=${id}`);
    if (!response.ok) {
      const message = `${response.status} Error fetching list: ${response.statusText}`;
      throw new Error(message);
    }
    const data = await response.json();

    if (!data.items) {
      throw new Error("ERROR Room items missing from fetch room response");
    }

    const items = data.items.map((item) => {
      return new DormItem(item);
    });
    return items;
  }

  /*
        Pushes a new item to the list, passes the resulting item back in the callback
        (with new, server-assigned properties such as id)
    */
  static async addListItem(item) {
    // /* TODO: send call to server */
    if (!item.name) {
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

  // Sends request to create a list, adds some items to it, and returns the id of the list.
  static async CREATE_TEST_ROOM() {
    const roomID = await DataController.createRoom();

    const itemResponse1 = await fetch("/list/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        listID: roomID,
        name: "Fridge",
        quantity: 4,
      }),
    });
    if (!itemResponse1.ok) {
      const data = await itemResponse1.json();
      const message = `${itemResponse1.status} Error adding item1 to test room: ${data.message}`;
      console.error(message);
    }

    const itemResponse2 = await fetch("/list/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        listID: roomID,
        name: "Microwave",
        quantity: 1,
      }),
    });
    if (!itemResponse2.ok) {
      const data = await itemResponse2.json();
      const message = `${itemResponse2.status} Error adding item2 to test room: ${data.message}`;
      console.error(message);
    }

    return roomID;
  }
}

export default DataController;
