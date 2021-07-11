import RoomActions from "./RoomActions";
import initialState from "./initialState";

let RoomReducer = (state, action) => {
  if (action.payload?.sendToEditor !== false) {
    state.editorActionQueue = [...state.editorActionQueue, action];
  }

  switch (action.type) {
    case RoomActions.connectedToRoom:
      return {
        ...state,
        loading: false,
        templateId: action.payload.templateId,
        bounds: action.payload.bounds,
        items: action.payload.items,
        roomName: action.payload.roomName,
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

    case RoomActions.userNamesUpdated:
      return {
        ...state,
        userNames: action.payload.userNames,
      };

    case RoomActions.itemAdded:
      return {
        ...state,
        items: [...state.items, action.payload.item],
      };

    case RoomActions.itemDeleted:
      return {
        ...state,
        selectedItemID:
          state.selectedItemID !== null &&
          state.selectedItemID !== action.payload.id
            ? state.selectedItemID
            : null,
        items: state.items.filter((item) => item.id !== action.payload.id),
      };

    case RoomActions.itemsUpdated:
      const updatedItems = {};
      let selectedItemID = state.selectedItemID;
      for (let i = 0; i < action.payload.items.length; i++) {
        const id = action.payload.items[i].id;
        const updated = action.payload.items[i].updated;
        // If item was removed from editor and it was selected, deselect it
        if (
          selectedItemID !== null &&
          selectedItemID === id &&
          updated.visibleInEditor === false
        ) {
          selectedItemID = null;
        }
        updatedItems[id] = updated;
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
        selectedItemID: selectedItemID,
        items: itemArray,
      };

    case RoomActions.itemSelected:
      return { ...state, selectedItemID: action.payload.id };

    case RoomActions.boundsUpdated:
      const updatedBounds = action.payload.bounds ?? [];
      return {
        ...state,
        bounds: updatedBounds,
      };

    case RoomActions.loading:
      return initialState;

    case RoomActions.roomNameUpdated:
      return {
        ...state,
        roomName: action.payload.roomName,
      };

    case RoomActions.error:
      return { ...state, loading: false, error: action.payload.error };

    default:
      return state;
  }
};

export default RoomReducer;
