import { Provider } from "react-redux";
import React from "react";
import { applyMiddleware, createStore } from "redux";

import DataRequests from "../controllers/DataRequests";
import RoomActions from "./RoomActions";
import RoomReducer from "./RoomReducer";
import RoomSocketConnection from "../controllers/RoomSocketConnection";
import StorageController from "../controllers/StorageController";
import initialState from "./initialState";
import thunk from "redux-thunk";

/* Handles socket error message cases. Outputs a specific error message to console and 
  returns a string with a more presentable message (if the error was recognized) 
  that can be displayed in the UI */
const handleSocketErrorEvent = (data) => {
  const action = data.action;
  if (action === undefined) {
    console.error("Received 'actionFailed' event with missing 'action' field in data");
    return null;
  }
  switch (action) {
    case "addItem":
      console.error("Error adding item.", data.message);
      return "Failed to create a new item.";
    case "deleteItem":
      console.error("Error deleting item.", data.message);
      return "Failed to delete item.";
    case "updateItems":
      console.error("Error updating item.", data.message);
      return "Failed to update item in editor.";
    case "editItem":
      console.error("Error editing item.", data.message);
      return "Failed to edit item properties.";
    case "updateLayout":
      console.error("Error updating bounds. ", data.message);
      return "Failed to update room bounds.";
    case "cloneRoom":
      console.error("Error cloning room. ", data.message);
      return "Failed to clone room from given ID. Make sure you are using a valid template ID.";
    default:
      console.error("Unknown socket event error.", data);
      return null;
  }
};

export const RoomProvider = ({ children }) => {
  const store = createStore(RoomReducer, initialState, applyMiddleware(thunk));

  return <Provider store={store}>{children}</Provider>;
};

export const connectToRoom = (id) => async (dispatch, getState) => {
  dispatch({ type: RoomActions.loading });

  try {
    const userName = StorageController.getUsername();

    if (userName !== null) {
      dispatch({ type: RoomActions.setUserName, payload: { userName } });
    }

    const roomObj = await DataRequests.getRoomData(id);
    const connection = new RoomSocketConnection(id, () => {
      // Called when socket connection has been opened
      console.log("Successfully connected to Room");

      // Add this room to local history of viewed rooms
      StorageController.addRoomToHistory(id, roomObj.data.name);

      dispatch({
        type: RoomActions.connectedToRoom,
        payload: {
          items: roomObj.data.items,
          templateId: roomObj.templateId,
          roomName: roomObj.data.name,
          bounds: roomObj.data.vertices,
          socketConnection: connection,
        },
      });
    });

    connection.onClose = () => {
      console.warn("Lost connection to Room");
      dispatch({ type: RoomActions.connectionClosed });
    };

    connection.on("actionFailed", (data) => {
      const errorMessage = handleSocketErrorEvent(data);
      if (errorMessage) {
        const error = new Error(errorMessage);
        dispatch({
          type: RoomActions.error,
          payload: { error },
        });
      }
    });

    connection.on("itemAdded", (data) => {
      dispatch({ type: RoomActions.itemAdded, payload: { item: data } });
    });

    connection.on("itemsUpdated", (data) => {
      dispatch({
        type: RoomActions.itemsUpdated,
        payload: { items: data.items },
      });
    });

    connection.on("itemDeleted", (data) => {
      dispatch({
        type: RoomActions.itemDeleted,
        payload: { id: data.id },
      });
    });

    connection.on("layoutUpdated", (data) => {
      dispatch({
        type: RoomActions.boundsUpdated,
        payload: { bounds: data.vertices },
      });
    });

    connection.on("roomNameUpdated", (data) => {
      StorageController.addRoomToHistory(id, data.name);

      dispatch({
        type: RoomActions.roomNameUpdated,
        payload: { roomName: data.name },
      });
    });

    connection.on("roomCloned", (data) => {
      window.location.reload();
    });

    connection.on("roomDeleted", (data) => {
      StorageController.removeRoomFromHistory(id);

      window.location.href = "/";
      dispatch({
        type: RoomActions.roomDeleted,
        payload: {},
      });
    });

    connection.on("nicknamesUpdated", (data) => {
      let { users } = data;

      dispatch({
        type: RoomActions.userNamesUpdated,
        payload: { userNames: users },
      });
    });
  } catch (error) {
    console.error("Failed to connect to room: " + error.message);
    dispatch({ type: RoomActions.error, payload: { error } });
  }
};

export const setUserName = (userName) => async (dispatch, getState) => {
  const { socketConnection } = getState();

  if (userName.length === 0) userName = null;

  StorageController.setUsername(userName);

  socketConnection.send({
    event: "updateNickname",
    sendResponse: true,
    data: { userName },
  });

  dispatch({ type: RoomActions.setUserName, payload: { userName } });
};

export const cloneRoom = (id, templateId) => async (dispatch, getState) => {
  const { socketConnection } = getState();

  socketConnection.send({
    event: "cloneRoom",
    sendResponse: true,
    data: {
      templateId: templateId,
    },
  });
};

export const addItem = (item) => async (dispatch, getState) => {
  const { socketConnection } = getState();

  socketConnection.send({
    event: "addItem",
    sendResponse: true,
    data: item,
  });
};

/* Sends socket message expecting a response (containing the same data as sent) if 
successful. Used for updates that don't need to be immediate locally (e.g. Changing the 
name of an item) */
export const updateItems = (items) => async (dispatch, getState) => {
  if (items.length === 0) return;

  const { socketConnection } = getState();

  socketConnection.send({
    event: "updateItems",
    sendResponse: true,
    data: {
      items: items,
    },
  });
};

/* Sends socket message saying that item has been updated. Doesn't expect a response if
successful. Used for updates that need to be immediately shown locally (e.g. moving an
item in the editor) */
export const updatedItems = (items) => async (dispatch, getState) => {
  const { socketConnection } = getState();

  socketConnection.send({
    event: "updateItems",
    sendResponse: false,
    data: {
      items: items,
    },
  });

  // Since no response message is expected, immediately dispatch update
  dispatch({
    type: RoomActions.itemsUpdated,
    payload: { items, sendToEditor: false },
  });
};

export const deleteItem = (item) => async (dispatch, getState) => {
  const { socketConnection } = getState();

  socketConnection.send({
    event: "deleteItem",
    sendResponse: true,
    data: {
      id: item.id,
    },
  });
};

export const deleteRoom = (id) => async (dispatch, getState) => {
  const { socketConnection } = getState();

  socketConnection.send({
    event: "deleteRoom",
    sendResponse: true,
    data: {
      id,
    },
  });
};

export const updateBounds = (bounds) => async (dispatch, getState) => {
  const { socketConnection } = getState();

  socketConnection.send({
    event: "updateLayout",
    sendResponse: true,
    data: {
      vertices: bounds,
    },
  });
};

export const updateRoomName = (id, roomName) => async (dispatch, getState) => {
  if (roomName == null || roomName.length === 0) return;

  const { socketConnection } = getState();

  socketConnection.send({
    event: "updateRoomName",
    sendResponse: true,
    data: {
      name: roomName,
    },
  });
};

export const itemSelected = (id) => async (dispatch, getState) => {
  dispatch({
    type: RoomActions.itemSelected,
    payload: { id, sendToEditor: false },
  });
};

export const clearEditorActionQueue = () => async (dispatch, getState) => {
  dispatch({ type: RoomActions.clearEditorActionQueue });
};
