/**
 * StorageController is an abstraction of the LocalStorage API that
 * allows the user to save / get data without messing around with the
 * browser. Handles the serialization of Javascript objects.
 */
export default class StorageController {
  static HISTORY_KEY = "history";
  static HISTORY_MAX_LENGTH = 25;

  /**
   * Set the username that is stored in the browser.
   * @param { string } username
   */
  static setUsername(username) {
    StorageController.set("userName", username);
  }

  /**
   * Returns the username stored within the browser.
   * @returns { string }
   */
  static getUsername() {
    return StorageController.get("userName");
  }

  /**
   * Add a new room to the history store within the browser. If a room with a matching ID is already stored, the data for that room will be updated and the room will be moved to the front of the array
   * @param { string } id ID of room
   * @param { string } name Name of room
   * @returns { Array<object> } Updated history array
   */
  static historyAddRoom(id, name) {
    let history = StorageController.historyGetRooms();
    let favorite = false;
    history = history.filter((r) => {
      if (r.id === id) {
        favorite = r.favorite;
        return false;
      }
      return true;
    });
    history.unshift({ id, name, favorite });

    if (history.length > StorageController.HISTORY_MAX_LENGTH) {
      history.splice(StorageController.HISTORY_MAX_LENGTH);
    }

    StorageController.set(StorageController.HISTORY_KEY, JSON.stringify(history));
    return history;
  }

  /**
   * Remove a room from the history by its ID. Returns updated history
   * @param { string } id ID of room
   * @returns { Array<object> } Updated history array
   */
  static historyRemoveRoom(id) {
    let history = StorageController.historyGetRooms();

    history = history.filter((room) => room.id !== id);

    StorageController.set(StorageController.HISTORY_KEY, JSON.stringify(history));
    return history;
  }

  /**
   * Updates the name of one or more rooms in the history array.
   * @param { Array<{ string : string }> } Object containing updated `id : name` pairs for one or more rooms
   * @returns { Array<object> } Updated history array
   */
  static historyUpdateRoomNames(updates) {
    let history = StorageController.historyGetRooms();

    for (let i = 0; i < history.length; i++) {
      const id = history[i].id;
      if (id in updates) {
        history[i].name = updates[id];
      }
    }

    StorageController.set(StorageController.HISTORY_KEY, JSON.stringify(history));
    return history;
  }

  /**
   * Favorite a room. If this room is not in the histroy or already favorited nothing will change.
   * @param { string } id ID of room
   * @returns { Array<object> } Updated history array
   */
  static historyFavoriteRoom(id) {
    let history = StorageController.historyGetRooms();
    for (let i = 0; i < history.length; i++) {
      if (history[i].id === id) history[i].favorite = true;
    }

    StorageController.set(StorageController.HISTORY_KEY, JSON.stringify(history));
    return history;
  }

  /**
   * Unfavorite a room. If this room is not in the history or already unfavorited nothing will change.
   * @param { string } id ID of room
   * @returns { Array<object> } Updated history array
   */
  static historyUnfavoriteRoom(id) {
    let history = StorageController.historyGetRooms();
    for (let i = 0; i < history.length; i++) {
      if (history[i].id === id) history[i].favorite = false;
    }

    StorageController.set(StorageController.HISTORY_KEY, JSON.stringify(history));
    return history;
  }

  /**
   * Returns room history array. Room are ordered by most recently accessed.
   * @returns { Array<object> }
   */
  static historyGetRooms() {
    let historyData = StorageController.get(StorageController.HISTORY_KEY);
    let history;
    let invalid = false;
    if (historyData === null) invalid = true;
    try {
      history = JSON.parse(historyData);
    } catch {
      invalid = true;
    }
    if (!Array.isArray(history)) invalid = true;

    if (invalid) {
      StorageController.set(StorageController.HISTORY_KEY, JSON.stringify([]));
      return [];
    }

    history = history.filter((r, index) => {
      if (
        index < StorageController.HISTORY_MAX_LENGTH &&
        typeof r === "object" &&
        "id" in r &&
        "name" in r &&
        "favorite" in r
      )
        return true;
      invalid = true;
      return false;
    });

    if (invalid) StorageController.set(StorageController.HISTORY_KEY, JSON.stringify(history));
    return history;
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
   * @returns { string }
   */
  static get(key) {
    return window.localStorage.getItem(key);
  }
}
