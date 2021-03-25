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
     * Append a new room ID to the history store within the browser. Does not
     * allow for any duplicates.
     * @param {*} roomId 
     */
    static addRoomToHistory(roomId, name) {
        let history = StorageController.getRoomsFromHistory();
        let duplicates = false;
        
        history.forEach((page, id) => {
            if(page.id === roomId) {
                duplicates = true;

                if(page.name !== name) {
                    history[id].name = name;
                }
            }
        });

        if(!duplicates) {
            history.push({
                id: roomId,
                name
            });    
        }

        StorageController.set("history", JSON.stringify(history));
    }

    /**
     * Get array of room ID's that are stored in the browser
     */
    static getRoomsFromHistory() {
        let historyData = StorageController.get("history");

        if(historyData == null)
            historyData = "[]";

        let history = JSON.parse(historyData);

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
     */
    static get(key) {
        return window.localStorage.getItem(key);
    }
}