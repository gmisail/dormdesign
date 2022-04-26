import React from "react";

import { Provider } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import reduceReducers from "reduce-reducers";
import initialState from "./initialState";
import { templateReducer, roomReducer } from "./reducers";
import { TemplateActions, RoomActions } from "./actions";

import DataRequests from "../controllers/DataRequests";
import RoomSocketConnection from "../controllers/RoomSocketConnection";
import StorageController from "../controllers/StorageController";

/*
  reduceReducers combines the reducers into one reducer that uses the same, flat state (as opposed to the built in combineReducers function from redux that would generate nested, separate state for each reducer)

  Shared state for each reducer here is convenient since the TemplateRoute state is basically the same as the RoomRoute state, but with some fields removed
*/
const rootReducer = reduceReducers(initialState, roomReducer, templateReducer);

export const RoomProvider = ({ children }) => {
  const store = createStore(rootReducer, applyMiddleware(thunk));

  return <Provider store={store}>{children}</Provider>;
};

export const connectToTemplate = (id) => async (dispatch, getState) => {
  dispatch({ type: TemplateActions.loading });
  try {
    const templateObj = await DataRequests.getTemplateData(id);
    dispatch({
      type: TemplateActions.connectedToRoom,
      payload: {
        items: templateObj.data.items,
        templateId: templateObj.templateId,
        roomName: templateObj.data.name,
        bounds: templateObj.data.vertices,
      },
    });
  } catch (error) {
    console.error("Failed to connect to template: " + error.message);
    dispatch({ type: TemplateActions.error, payload: { error: error.message } });
  }
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
      if (data.action === undefined) {
        console.error("Received invalid 'actionFailed' event");
        return;
      }
      console.error("Socket Action Failed: ", data);
      dispatch({
        type: RoomActions.socketError,
        payload: { ...data },
      });
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
    dispatch({ type: RoomActions.error, payload: { message: error.message } });
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
