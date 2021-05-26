/**
 * StorageController is an abstraction of the LocalStorage API that
 * allows the user to save / get data without messing around with the
 * browser. Handles the serialization of Javascript objects.
 */
export default class StorageController {
  /**
   * Set the username that is stored in the browser.
   * @param {*} username
   */
  static setUsername(username) {
    StorageController.set("userName", username);
  }

  /**
   * Returns the username stored within the browser.
   */
  static getUsername() {
    return StorageController.get("userName");
  }

  /**
   * Append a new room ID to the history store within the browser. If a room with a matching ID is already stored, the data for that room will be updated
   * @param {*} roomId
   */
  static addRoomToHistory(roomId, name) {
    let history = StorageController.getRoomsFromHistory();
    let duplicates = false;

    history.forEach((page, id) => {
      if (page.id === roomId) {
        duplicates = true;

        if (page.name !== name) {
          history[id].name = name;
        }
      }
    });

    if (!duplicates) {
      history.unshift({
        id: roomId,
        name,
      });
    }

    StorageController.set("history", JSON.stringify(history));
  }

  /**
   * Get array of room ID's that are stored in the browser. Array is ordered with most recent rooms first
   */
  static getRoomsFromHistory() {
    let historyData = StorageController.get("history");
    let history = [];

    if (historyData != null) history = JSON.parse(historyData);

    return history;
  }

  /**
   * Remove a room from the history by its ID. Return the original array if nothing changed.
   * @param { string } id
   */
  static removeRoomFromHistory(id) {
    let historyData = StorageController.getRoomsFromHistory();

    console.log(
      historyData,
      historyData.filter((room) => room.id !== id)
    );

    StorageController.set(
      "history",
      JSON.stringify(historyData.filter((room) => room.id !== id))
    );
  }

  /**
   * Set key in LocalStorage to value
   * @param { string } key
   * @param { string } value
   */
  static set(key, value) {
    window.localStorage.setItem(key, value);
  }

  /**
   * Get value in LocalStorage at key
   * @param { string } key
   */
  static get(key) {
    return window.localStorage.getItem(key);
  }
}
