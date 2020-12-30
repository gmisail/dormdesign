import React, { Component } from "react";
import { RoomContext, RoomActions } from "../../routes/RoomRoute/RoomContext";
import SceneController from "../../room-editor/SceneController";
import RoomEditorObject from "../../room-editor/RoomEditorObject";
import IconButton from "../IconButton/IconButton";
import { MdFilterCenterFocus } from "react-icons/md";
import { BiPlus, BiMinus, BiLockOpenAlt, BiLockAlt } from "react-icons/bi";
import { RiClockwiseLine } from "react-icons/ri";
import "./RoomEditor.scss";
import Vector2 from "../../room-editor/Vector2";

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
  state = {
    lastSelectedItemID: null,
  };

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

    this.zoomScale = 1.3;
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
    if (obj !== null) {
      this.setState({ lastSelectedItemID: obj.id });
    }
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
    /* Determine locked from lastSelectedItemID rather than current selectedItemID so that it doesn't 
    switch during button fade animation */
    const locked = this.state.lastSelectedItemID
      ? this.roomObject.roomItems.get(this.state.lastSelectedItemID)
          .movementLocked
      : false;
    return (
      <div className="room-editor">
        <div className="room-editor-overlay">
          <div className="room-editor-toolbar">
            <IconButton
              onClick={this.rotateSelectedItem}
              disabled={locked}
              data-hidden={selectedItemID === null ? "true" : "false"}
            >
              <RiClockwiseLine />
            </IconButton>
            <IconButton
              onClick={this.lockSelectedItem}
              data-hidden={selectedItemID === null ? "true" : "false"}
              style={{ fontSize: "0.95em" }}
            >
              {locked ? <BiLockAlt /> : <BiLockOpenAlt />}
            </IconButton>
          </div>
          <div className="room-editor-footer">
            <span>1 Cell = 1 Square Foot</span>
          </div>
          <div className="room-editor-corner-controls">
            <IconButton
              onClick={() => {
                if (this.roomObject !== undefined) {
                  this.roomObject.scaleAbout(
                    new Vector2(this.zoomScale, this.zoomScale),
                    new Vector2(
                      this.scene.canvas.width / 2,
                      this.scene.canvas.height / 2
                    )
                  );
                }
              }}
            >
              <BiPlus />
            </IconButton>
            <IconButton
              onClick={() => {
                if (this.roomObject !== undefined) {
                  this.roomObject.centerView();
                }
              }}
            >
              <MdFilterCenterFocus />
            </IconButton>
            <IconButton
              onClick={() => {
                if (this.roomObject !== undefined) {
                  this.roomObject.scaleAbout(
                    new Vector2(1 / this.zoomScale, 1 / this.zoomScale),
                    new Vector2(
                      this.scene.canvas.width / 2,
                      this.scene.canvas.height / 2
                    )
                  );
                }
              }}
            >
              <BiMinus />
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
