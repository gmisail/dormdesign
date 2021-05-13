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
class DataRequests {
  // Creates a new room and returns room ID sent back from server
  static async createRoom(name) {
    const response = await fetch("/api/room/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = `${response.status} Error creating room: ${data.message}`;
      console.error(message);

      return null;
    }

    return data;
  }

  // Retrieves the Room's data from the server.
  static async getRoomData(id) {
    if (!id) {
      throw new Error("Can't fetch room data. Room ID is undefined");
    }

    const response = await fetch(`/api/room/get?id=${id}`);
    const data = await response.json();

    if (!response.ok) {
      const message = `${response.status} Error fetching room: ${data.message}`;
      throw new Error(message);
    }

    if (!data.items) {
      throw new Error("Room items missing from fetch room response");
    }

    const items = data.items.map((item) => {
      return new DormItem(item);
    });

    return {
      ...data,
      items,
    };
  }

  static async cloneRoom(id, target) {
    if (!id || !target) {
      throw new Error("Can't clone room; either ID or target ID is undefined.");
    }

    const response = await fetch(
      "/api/room/clone?id=" + id + "&target_id=" + target
    );
    const data = response.json();

    if (!data.message) {
      window.location.reload();
    } else {
      throw new Error(data.message);
    }
  }

  static async generatePreview(id) {
    if (!id) {
      throw new Error("Can't generate template from undefined template.");
    }

    const response = await fetch("/api/preview?id=" + id);
    const data = response.json();

    if (!response.ok) {
      const message = `${response.status} Error generating room preview: ${data.message}`;
      throw new Error(message);
    }

    return data;
  }

  // Sends request to create a room, adds some items to it, and returns the id of the room.
  static async CREATE_TEST_ROOM(name) {
    const roomData = await DataRequests.createRoom(name);
    const roomID = roomData.id;

    const itemResponse1 = await fetch("/api/room/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomID: roomID,
        name: "Fridge",
        quantity: 4,
      }),
    });
    if (!itemResponse1.ok) {
      const data = await itemResponse1.json();
      const message = `${itemResponse1.status} Error adding item1 to test room: ${data.message}`;
      console.error(message);
    }

    const itemResponse2 = await fetch("/api/room/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomID: roomID,
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

export default DataRequests;
