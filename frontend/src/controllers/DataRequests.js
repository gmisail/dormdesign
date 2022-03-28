/**
 *  Data creation / modification handler.
 */
class DataRequests {
  // Creates a new room and returns room ID sent back from server
  static async createRoom(name, templateId) {
    const response = await fetch("/api/room/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        templateId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = `${response.status} Error creating room: ${data.message}`;
      throw new Error(message);
    }

    return data;
  }

  // Retrieves the Room's data from the server.
  static async getRoomData(id) {
    if (!id) {
      throw new Error("Can't fetch room data. Room ID is undefined");
    }

    const response = await fetch(`/api/room/get?id=${id}`);
    const responseData = await response.json();

    if (!response.ok) {
      const message = `${response.status} Error fetching room: ${responseData.message}`;
      throw new Error(message);
    }

    return responseData;
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

  /**
   * Generates a preview from the given room id or templateId
   * @param {string} id
   * @param {boolean} isTemplate Set to true if the id is a templateId
   * @returns Preview
   * @throws When parameters are invalid or preview generation fails
   */
  static async generatePreview(id, isTemplate = false) {
    if (id === undefined || id === null) {
      throw new Error("'id' is null or undefined");
    }

    const response = await fetch(`/api/preview/${isTemplate ? "template" : "room"}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      const message = `${response.status} Error generating room preview: ${data.message}`;
      throw new Error(message);
    }

    return data.preview;
  }

  static async getFeaturedTemplates() {
    const response = await fetch("/api/templates/featured", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      const message = `${response.status} Error getting featured templates: ${data.message}`;
      throw new Error(message);
    }

    return data.templates;
  }
}

export default DataRequests;
