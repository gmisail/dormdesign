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
      const message = `Error creating room: ${data.message}`;
      throw new Error(message);
    }

    return data;
  }

  // Retrieves a Room's data from the server.
  static async getRoomData(id) {
    if (!id) {
      throw new Error("Can't fetch room data. Room ID is undefined");
    }

    const response = await fetch(`/api/room/${id}`);
    const responseData = await response.json();

    if (!response.ok) {
      const message = `Error fetching room: ${responseData.message}`;
      throw new Error(message);
    }

    return responseData;
  }

  // Retrieves a Template's data from the server.
  static async getTemplateData(templateId) {
    if (!templateId) {
      throw new Error("Can't fetch template data. Template ID is undefined");
    }

    const response = await fetch(`/api/template/${templateId}`);
    const responseData = await response.json();

    if (!response.ok) {
      const message = `Error fetching template: ${responseData.message}`;
      throw new Error(message);
    }

    return responseData;
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

    const response = await fetch(`/api/preview/${isTemplate ? "template" : "room"}/${id}`);
    const data = await response.json();

    if (!response.ok) {
      const message = `Error generating room preview: ${data.message}`;
      throw new Error(message);
    }

    return data.preview;
  }

  static async getFeaturedTemplates() {
    const response = await fetch("/api/template/featured");
    const data = await response.json();

    if (!response.ok) {
      const message = `Error getting featured templates: ${data.message}`;
      throw new Error(message);
    }

    return data.templates;
  }
}

export default DataRequests;
