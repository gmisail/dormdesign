import React, { useReducer, useCallback, createContext } from "react";
import DataRequests from "../../controllers/DataRequests";
import SocketConnection from "../../controllers/SocketConnection";
import DormItem from "../../models/DormItem";

export const RoomActions = {
  connectedToRoom: "CONNECTED_TO_ROOM",
  connectionClosed: "CONNECTION_CLOSED",
  setUserName: "SET_USER_NAME",
  itemAdded: "ITEM_ADDED",
  itemDeleted: "ITEM_DELETED",
  itemsUpdated: "ITEM_UPDATED",
  itemSelected: "ITEM_SELECTED",
  loading: "LOADING",
  error: "ERROR",
  clearEditorActionQueue: "CLEAR_EDITOR_ACTION_QUEUE",
};

const initialState = {
  items: null,
  loading: true,
  error: null,
  socketConnection: null,
  userName: null,
  editorActionQueue: [],
  selectedItemID: null,
};

const roomReducer = (state, action) => {
  if (action.payload?.sendToEditor !== false) {
    state.editorActionQueue = [...state.editorActionQueue, action];
  }
  switch (action.type) {
    case RoomActions.connectedToRoom:
      return {
        ...state,
        loading: false,
        items: action.payload.data,
        socketConnection: action.payload.socketConnection,
      };
    case RoomActions.connectionClosed:
      return {
        items: null,
        editorActionQueue: [],
        selectedItemID: null,
        loading: false,
        socketConnection: null,
        error: new Error("Connection to room lost"),
      };
    case RoomActions.clearEditorActionQueue:
      return {
        ...state,
        editorActionQueue: [],
      };
    case RoomActions.setUserName:
      return {
        ...state,
        userName: action.payload.userName,
      };
    case RoomActions.itemAdded:
      return {
        ...state,
        items: [...state.items, action.payload.item],
      };
    case RoomActions.itemDeleted:
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.id),
      };
    case RoomActions.itemsUpdated:
      const updatedItems = {};
      for (let i = 0; i < action.payload.items.length; i++) {
        updatedItems[action.payload.items[i].id] =
          action.payload.items[i].updated;
      }

      const oldItemArray = state.items;
      let itemArray = [];
      for (let i = 0; i < oldItemArray.length; i++) {
        let item = oldItemArray[i];
        itemArray.push(item);
        const updated = updatedItems[item.id];
        if (updated !== undefined) {
          item.update(updated);
        }
      }

      return {
        ...state,
        items: itemArray,
      };
    case RoomActions.itemSelected:
      return { ...state, selectedItemID: action.payload.id };
    case RoomActions.loading:
      return initialState;
    case RoomActions.error:
      return { ...state, loading: false, error: action.payload.error };
    default:
      return state;
  }
};

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
    default:
      console.error("Unknown socket event error.", data);
      return null;
  }
};

export const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const [state, dispatch] = useReducer(roomReducer, initialState);

  const connectToRoom = useCallback(
    async (id) => {
      dispatch({ type: RoomActions.loading });

      try {
        const userName = window.localStorage.getItem("userName");
        if (userName !== null) {
          dispatch({ type: RoomActions.setUserName, payload: { userName } });
        }

        const data = await DataRequests.getRoomData(id);
        const connection = new SocketConnection(id, () => {
          // Called when socket connection has been opened
          console.log("Successfully connected to Room");
          dispatch({
            type: RoomActions.connectedToRoom,
            payload: { data: data, socketConnection: connection },
          });
        });

        connection.onClose = () => {
          console.warn("Lost connection to Room");
          dispatch({ type: RoomActions.connectionClosed });
        };

        connection.on("actionFailed", (data) => {
          console.log("RECEIVED ERROR MESSAGE", data);
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
      } catch (error) {
        dispatch({ type: RoomActions.error, payload: { error } });
      }
    },
    [dispatch]
  );

  const setUserName = useCallback(
    (userName) => {
      window.localStorage.setItem("userName", userName);
      dispatch({ type: RoomActions.setUserName, payload: { userName } });
    },
    [dispatch]
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
    addItem,
    updateItems,
    updatedItems,
    setUserName,
    deleteItem,
    clearEditorActionQueue,
    itemSelected,
  };
  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};