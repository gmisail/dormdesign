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

    return data;
  }

  static async cloneRoom(id, target) {
    if (!id || !target) {
      throw new Error("Can't clone room; either ID or target ID is undefined.");
    }

    const response = await fetch("/api/room/clone?id=" + id + "&target_id=" + target);
    const data = await response.json();

    if (!data.message) {
      window.location.reload();
    } else {
      throw new Error(data.message);
    }
  }

  static async generatePreview(ids) {
    if (ids === undefined || ids.length === 0) {
      throw new Error("'ids' is undefined or empty");
    }

    const response = await fetch("/api/preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ids),
    });
    const data = await response.json();

    if (!response.ok) {
      const message = `${response.status} Error generating room preview: ${data.message}`;
      throw new Error(message);
    }

    const { previews } = data;

    return previews;
  }
}

export default DataRequests;
