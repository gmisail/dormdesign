import { RoomActions, TemplateActions } from "./actions";
import initialState from "./initialState";

// Reducer for RoomRoute
export const roomReducer = (state, action) => {
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
          state.selectedItemID !== null && state.selectedItemID !== action.payload.id
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
        if (selectedItemID !== null && selectedItemID === id && updated.visibleInEditor === false) {
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
          Object.assign(item, updated);
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
      return { ...state, loading: false, error: action.payload.message };

    case RoomActions.socketError:
      let errorMessage;
      switch (action.payload.action) {
        case "addItem":
          errorMessage = "Failed to create a new item. " + action.payload.message;
          break;
        case "deleteItem":
          errorMessage = "Failed to delete item. " + action.payload.message;
          break;
        case "updateItems":
          errorMessage = "Failed to update item in editor. " + action.payload.message;
          break;
        case "editItem":
          errorMessage = "Failed to edit item properties. " + action.payload.message;
          break;
        case "updateLayout":
          errorMessage = "Failed to update room bounds. " + action.payload.message;
          break;
        case "cloneRoom":
          errorMessage = "Failed to clone room. Make sure the template ID is valid. ";
          break;
        default:
          errorMessage = `Unknown error '${action.payload.action}. ${action.payload.message}`;
      }
      return { ...state, error: errorMessage };

    default:
      return state;
  }
};

// Reducer for TemplateRoute
export const templateReducer = (state, action) => {
  switch (action.type) {
    case TemplateActions.connectedToRoom:
      return {
        ...state,
        loading: false,
        templateId: action.payload.templateId,
        bounds: action.payload.bounds,
        items: action.payload.items,
        roomName: action.payload.roomName,
        socketConnection: action.payload.socketConnection,
      };

    case TemplateActions.itemSelected:
      return { ...state, selectedItemID: action.payload.id };

    case TemplateActions.loading:
      return initialState;

    case TemplateActions.error:
      return { ...state, loading: false, error: action.payload.error };

    default:
      return state;
  }
};
