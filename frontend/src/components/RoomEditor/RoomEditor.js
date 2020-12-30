import React, { Component } from "react";
import { RoomContext, RoomActions } from "../../routes/RoomRoute/RoomContext";
import SceneController from "../../room-editor/SceneController";
import RoomEditorObject from "../../room-editor/RoomEditorObject";
import IconButton from "../IconButton/IconButton";
import { BsArrowClockwise, BsUnlock, BsLock } from "react-icons/bs";
import { MdFilterCenterFocus } from "react-icons/md";
import "./RoomEditor.scss";

// Converts DormItem properties to properties expected by RoomEditorObject
const itemToEditorProperties = (props) => {
  return {
    id: props.id,
    position: props.editorPosition
      ? { x: props.editorPosition.x, y: props.editorPosition.y }
      : undefined,
    name: props.name,
    width: props.dimensions?.width,
    height: props.dimensions?.length,
    rotation: props.editorRotation,
    movementLocked: props.editorLocked,
    zIndex: props.editorZIndex,
    visible: props.visibleInEditor,
  };
};

// Converts (relevant) editor properties to properties expected by DormItem
const editorToItemProperties = (props) => {
  return {
    editorPosition: props.position
      ? { x: props.position.x, y: props.position.y }
      : undefined,
    editorRotation: props.rotation,
    editorLocked: props.movementLocked,
    editorZIndex: props.zIndex,
  };
};

class RoomEditor extends Component {
  static contextType = RoomContext;

  componentDidMount() {
    const scene = new SceneController(this.mainCanvasRef);
    scene.backgroundColor = "#fff";

    const room = new RoomEditorObject({
      scene: scene,
      backgroundColor: "#fff",
      onObjectsUpdated: this.itemsUpdatedInEditor,
      onObjectSelected: this.itemSelectedInEditor,
      selectedObjectID: undefined,
      fontFamily: "Source Sans Pro",
    });
    scene.addChild(room);

    this.scene = scene;
    this.roomObject = room;

    // Handle any actions that have accumlated in editorActionQueue
    this.handleEditorQueue();
  }

  handleEditorQueue() {
    const { editorActionQueue, clearEditorActionQueue } = this.context;
    for (let i = 0; i < editorActionQueue.length; i++) {
      const action = editorActionQueue[i];
      /* 
        NOTE:

        Errors here in development mode (specifically ones that show up as 
        warnings in console) are often caused by React repeating state updates 
        (causing duplicate messages to be added to editorActionQueue).

        There might be a way to avoid duplicate events in the queue (maybe some sort of ID system?) but for now its fine.

        https://reactjs.org/docs/strict-mode.html#detecting-unexpected-side-effects
      */
      switch (action.type) {
        case RoomActions.connectedToRoom:
          for (let i = 0; i < action.payload.items.length; i++) {
            const translatedItem = itemToEditorProperties(
              action.payload.items[i]
            );
            this.roomObject.addItemToRoom(translatedItem);
            this.roomObject.setBounds(action.payload.bounds);
          }
          break;
        case RoomActions.itemsUpdated:
          for (let i = 0; i < action.payload.items.length; i++) {
            const id = action.payload.items[i].id;
            const updated = action.payload.items[i].updated;
            this.roomObject.updateRoomItem(id, itemToEditorProperties(updated));
          }
          break;
        case RoomActions.itemAdded:
          this.roomObject.addItemToRoom(
            itemToEditorProperties(action.payload.item)
          );
          break;
        case RoomActions.itemDeleted:
          this.roomObject.removeItemFromRoom(action.payload.id);
          break;
        case RoomActions.boundsUpdated:
          this.roomObject.setBounds(action.payload.bounds);
          break;
        default:
          continue;
      }
    }
    if (editorActionQueue.length > 0) {
      clearEditorActionQueue();
    }
  }

  componentDidUpdate() {
    this.handleEditorQueue();
  }

  itemsUpdatedInEditor = (items) => {
    const { updatedItems } = this.context;
    updatedItems(
      items.map(({ id, updated }) => {
        return {
          id,
          updated: editorToItemProperties(updated),
        };
      })
    );
  };

  itemSelectedInEditor = (obj) => {
    const { itemSelected } = this.context;
    itemSelected(obj === null ? null : obj.id);
  };

  rotateSelectedItem = () => {
    const { selectedItemID, updatedItems } = this.context;
    if (!selectedItemID) return;
    const sceneObj = this.roomObject.roomItems.get(selectedItemID);
    sceneObj.rotation += 90;
    updatedItems([
      {
        id: selectedItemID,
        updated: { editorRotation: sceneObj.rotation },
      },
    ]);
  };

  lockSelectedItem = () => {
    const { selectedItemID, updatedItems } = this.context;
    if (!selectedItemID) return;
    const sceneObj = this.roomObject.roomItems.get(selectedItemID);
    sceneObj.movementLocked = !sceneObj.movementLocked;
    updatedItems([
      {
        id: selectedItemID,
        updated: {
          editorLocked: sceneObj.movementLocked,
        },
      },
    ]);
  };

  render() {
    const { selectedItemID } = this.context;
    const locked = selectedItemID
      ? this.roomObject.roomItems.get(selectedItemID).movementLocked
      : false;
    return (
      <div className="room-editor">
        <div className="room-editor-overlay">
          <div className="room-editor-toolbar">
            <IconButton
              onClick={this.lockSelectedItem}
              disabled={selectedItemID === null}
              style={{ fontSize: "0.95em" }}
            >
              {locked ? <BsLock /> : <BsUnlock />}
            </IconButton>
            <IconButton
              onClick={this.rotateSelectedItem}
              disabled={selectedItemID === null || locked}
            >
              <BsArrowClockwise />
            </IconButton>
          </div>
          <div className="room-editor-footer">
            <span>1 Cell = 1 Square Foot</span>
          </div>
          <div className="room-editor-corner-controls">
            <IconButton
              onClick={() => {
                if (this.roomObject !== undefined) {
                  this.roomObject.centerView();
                }
              }}
            >
              <MdFilterCenterFocus />
            </IconButton>
          </div>
        </div>

        <canvas
          ref={(ref) => (this.mainCanvasRef = ref)}
          className="room-canvas"
        ></canvas>
      </div>
    );
  }
}

export default RoomEditor;
