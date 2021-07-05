import React, { createContext, useCallback, useReducer } from "react";

import DataRequests from "../controllers/DataRequests";
import DormItem from "../models/DormItem";
import RoomActions from "./RoomActions";
import RoomReducer from "./RoomReducer";
import SocketConnection from "../controllers/SocketConnection";
import StorageController from "../controllers/StorageController";
import initialState from "./initialState";

/* Handles socket error message cases. Outputs a specific error message to console and 
  returns a string with a more presentable message (if the error was recognized) 
  that can be displayed in the UI */
const handleSocketErrorEvent = (data) => {
  const action = data.action;
  if (action === undefined) {
    console.error(
      "Received 'actionFailed' event with missing 'action' field in data"
    );
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

export const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const [state, dispatch] = useReducer(RoomReducer, initialState);

  const connectToRoom = useCallback(
    async (id) => {
      dispatch({ type: RoomActions.loading });

      try {
        const userName = StorageController.getUsername();
        if (userName !== null) {
          dispatch({ type: RoomActions.setUserName, payload: { userName } });
        }

        const roomData = await DataRequests.getRoomData(id);
        const connection = new SocketConnection(id, () => {
          // Called when socket connection has been opened
          console.log("Successfully connected to Room");

          // Add this room to local history of viewed rooms
          StorageController.addRoomToHistory(id, roomData.name);

          dispatch({
            type: RoomActions.connectedToRoom,
            payload: {
              items: roomData.items,
              templateId: roomData.templateId,
              roomName: roomData.name,
              socketConnection: connection,
              bounds: roomData.vertices,
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
          const item = new DormItem(data);
          dispatch({ type: RoomActions.itemAdded, payload: { item } });
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
        });

        connection.on("nicknamesUpdated", (data) => {
          let { users } = data;

          dispatch({
            type: RoomActions.userNamesUpdated,
            payload: { userNames: users },
          });

          console.log(users);
        });
      } catch (error) {
        console.error("Failed to connect to room: " + error);
        dispatch({ type: RoomActions.error, payload: { error } });
      }
    },
    [dispatch]
  );

  const setUserName = useCallback(
    (userName) => {
      if (userName.length === 0) userName = null;

      StorageController.setUsername(userName);

      state.socketConnection.send({
        event: "updateNickname",
        sendResponse: true,
        data: { userName },
      });

      dispatch({ type: RoomActions.setUserName, payload: { userName } });
    },
    [state.socketConnection, dispatch]
  );

  const cloneRoom = useCallback(
    (id, target) => {
      state.socketConnection.send({
        event: "cloneRoom",
        sendResponse: true,
        data: {
          id,
          target_id: target,
        },
      });
    },
    [state.socketConnection]
  );

  const addItem = useCallback(
    (item) => {
      state.socketConnection.send({
        event: "addItem",
        sendResponse: true,
        data: item,
      });
    },
    [state.socketConnection]
  );

  /* Sends socket message expecting a response (containing the same data as sent) if 
  successful. Used for updates that don't need to be immediate locally (e.g. Changing the 
  name of an item) */
  const updateItems = useCallback(
    (items) => {
      if (items.length === 0) return;
      state.socketConnection.send({
        event: "updateItems",
        sendResponse: true,
        data: {
          items: items,
        },
      });
    },
    [state.socketConnection]
  );

  /* Sends socket message saying that item has been updated. Doesn't expect a response if
  successful. Used for updates that need to be immediately shown locally (e.g. moving an
  item in the editor) */
  const updatedItems = useCallback(
    (items) => {
      state.socketConnection.send({
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
    },
    [state.socketConnection, dispatch]
  );

  const deleteItem = useCallback(
    (item) => {
      state.socketConnection.send({
        event: "deleteItem",
        sendResponse: true,
        data: {
          id: item.id,
        },
      });
    },
    [state.socketConnection]
  );

  const deleteRoom = useCallback(
    (id) => {
      state.socketConnection.send({
        event: "deleteRoom",
        sendResponse: true,
        data: {
          id,
        },
      });

      dispatch({
        type: RoomActions.roomDeleted,
        payload: {},
      });
    },
    [state.socketConnection]
  );

  const updateBounds = useCallback(
    (bounds) => {
      state.socketConnection.send({
        event: "updateLayout",
        sendResponse: true,
        data: {
          vertices: bounds,
        },
      });
    },
    [state.socketConnection]
  );

  const updateRoomName = useCallback(
    (id, roomName) => {
      if (roomName == null || roomName.length === 0) return;
      state.socketConnection.send({
        event: "updateRoomName",
        sendResponse: true,
        data: {
          name: roomName,
        },
      });

      StorageController.addRoomToHistory(id, roomName);

      dispatch({
        type: RoomActions.roomNameUpdated,
        payload: { roomName },
      });
    },
    [state.socketConnection, dispatch]
  );

  const itemSelected = useCallback(
    (id) => {
      dispatch({
        type: RoomActions.itemSelected,
        payload: { id, sendToEditor: false },
      });
    },
    [dispatch]
  );

  const clearEditorActionQueue = useCallback(() => {
    dispatch({ type: RoomActions.clearEditorActionQueue });
  }, [dispatch]);

  const value = {
    ...state,
    connectToRoom,
    cloneRoom,
    addItem,
    updateItems,
    updateBounds,
    updateRoomName,
    updatedItems,
    setUserName,
    deleteItem,
    deleteRoom,
    clearEditorActionQueue,
    itemSelected,
  };
  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};
