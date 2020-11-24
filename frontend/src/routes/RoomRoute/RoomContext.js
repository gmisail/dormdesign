import React, { useReducer, useState, useCallback, createContext } from "react";
import DataRequests from "../../controllers/DataRequests";
import SocketConnection from "../../controllers/SocketConnection";
import DormItem from "../../models/DormItem";

const actions = {
  connectedToRoom: "CONNECTED_TO_ROOM",
  connectionClosed: "CONNECTION_CLOSED",
  MESSAGE_RECEIVED: "MESSAGE_RECEIVED",
  setName: "SET_NAME",
  itemAdded: "ITEM_ADDED",
  itemDeleted: "ITEM_DELETED",
  itemsUpdated: "ITEM_UPDATED",
  loading: "LOADING",
  error: "ERROR",
};

const initialState = {
  items: null,
  loading: true,
  error: null,
  socketConnection: null,
  name: null,
};

const roomReducer = (state, action) => {
  switch (action.type) {
    case actions.connectedToRoom:
      return {
        ...state,
        loading: false,
        items: action.payload.data,
        socketConnection: action.payload.socketConnection,
      };
    case actions.connectionClosed:
      return {
        ...state,
        loading: false,
        error: new Error("Connection lost"),
      };
    case actions.setName:
      return {
        ...state,
        name: action.payload.name,
      };
    case actions.itemAdded:
      return {
        ...state,
        items: [...state.items, action.payload.item],
      };
    case actions.itemDeleted:
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.id),
      };
    case actions.itemsUpdated:
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
    case actions.loading:
      return state;
    case actions.error:
      return { ...state, loading: false, error: action.payload.error };
    default:
      return state;
  }
};

export const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const [state, dispatch] = useReducer(roomReducer, initialState);

  const connectToRoom = useCallback(
    async (id) => {
      dispatch({ type: actions.loading });

      try {
        console.log("FETCHING ROOM DATA");

        const name = window.localStorage.getItem("name");
        console.log("STORED NAME", name);
        if (name !== null) {
          dispatch({ type: actions.setName, payload: { name } });
        }

        const data = await DataRequests.getRoomData(id);
        const connection = new SocketConnection(id, () => {
          // Called when socket connection has be opened
          console.log("Successfully connected to Room");
          dispatch({
            type: actions.connectedToRoom,
            payload: { data: data, socketConnection: connection },
          });
        });

        connection.onClose = () => {
          dispatch({ type: actions.connectionClosed });
        };

        connection.on("itemAdded", (data) => {
          const item = new DormItem(data);
          dispatch({ type: actions.itemAdded, payload: { item } });
        });

        connection.on("itemsUpdated", (data) => {
          dispatch({
            type: actions.itemsUpdated,
            payload: { items: data.items },
          });
        });

        connection.on("itemDeleted", (data) => {
          dispatch({
            type: actions.itemDeleted,
            payload: { id: data.id },
          });
        });
      } catch (error) {
        dispatch({ type: actions.error, payload: { error } });
      }
    },
    [dispatch]
  );

  const setName = useCallback((name) => {
    window.localStorage.setItem("name", name);
    dispatch({ type: actions.setName, payload: { name } });
  });

  const addItem = useCallback(
    (item) => {
      state.socketConnection.send({
        event: "addItem",
        sendResponse: true,
        data: item,
      });
    },
    [dispatch, state.socketConnection]
  );

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
    [dispatch, state.socketConnection]
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
    [dispatch, state.socketConnection]
  );

  console.log("RoomContext Rendered");

  const value = {
    ...state,
    connectToRoom,
    addItem,
    updateItems,
    setName,
    deleteItem,
  };
  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};
