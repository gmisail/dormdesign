import React, { Component } from "react";
import { RoomContext, RoomActions } from "../../context/RoomContext";
import SceneController from "../../room-editor/SceneController";
import RoomEditorObject from "../../room-editor/RoomEditorObject";
import IconButton from "../IconButton/IconButton";
import { BsBoundingBox, BsX, BsCheck } from "react-icons/bs";
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
    editingBounds: false,
    selectedPointX: "",
    selectedPointY: "",
  };

  componentDidMount() {
    const scene = new SceneController(this.mainCanvasRef);
    scene.backgroundColor = "#fff";

    const room = new RoomEditorObject({
      scene: scene,
      backgroundColor: "#fff",
      onObjectsUpdated: this.itemsUpdatedInEditor,
      onObjectSelected: this.itemSelectedInEditor,
      onBoundsUpdated: this.onBoundsUpdated,
      onBoundaryPointSelected: this.onBoundaryPointSelected,
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
            this.roomObject.bounds.points = action.payload.bounds;
            this.roomObject.centerView();
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
          // If bounds are currently being edited, don't update them locally with external changes
          if (!this.state.editingBounds) {
            this.roomObject.bounds.points = action.payload.bounds;
          }
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

  onBoundaryPointSelected = (point) => {
    this.setState({
      selectedPointX: point !== null ? point.x : "",
      selectedPointY: point !== null ? point.y : "",
    });
  };

  onClickDeleteSelectedPoint = () => {
    this.roomObject.bounds.deletePointAtIndex(
      this.roomObject.bounds.selectedPointIndex
    );
  };

  onBoundsUpdated = (points) => {
    const selectedPointIndex = this.roomObject.bounds.selectedPointIndex;
    if (selectedPointIndex !== null) {
      const selectedPoint = points[selectedPointIndex];
      this.setState({
        selectedPointX: selectedPoint.x,
        selectedPointY: selectedPoint.y,
      });
    }
  };

  onPointInputChanged = (evt) => {
    let value = evt.target.value;
    const name = evt.target.name;
    if (value.length !== 0) {
      value = parseFloat(value);
      // Prevent really big/small values
      value = Math.min(Math.max(value, -500), 500);
      const editedPoint = new Vector2(
        this.state.selectedPointX,
        this.state.selectedPointY
      );
      if (name === "selectedPointX") {
        editedPoint.x = value;
      } else {
        editedPoint.y = value;
      }
      // Update edited point value in the scene
      this.roomObject.bounds.setPointAtIndex(
        this.roomObject.bounds.selectedPointIndex,
        editedPoint
      );
    }
    this.setState({
      [name]: value,
    });
  };

  toggleEditingBounds = (saveEdits) => {
    const editing = !this.state.editingBounds;
    this.roomObject.bounds.editing = editing;
    if (editing) {
      // this.editedBounds = this.roomObject.bounds.points;
    } else {
      if (saveEdits) {
        // Save the edits made by updating the bounds
        this.context.updateBounds(this.roomObject.bounds.points);
      } else {
        // Don't save the edits, revert them to pre-edited state
        this.roomObject.bounds.points = this.context.bounds;
      }
    }
    if (this.roomObject.selectedObject) {
      this.roomObject.selectItem(null);
    }

    this.setState({ editingBounds: editing });
  };

  render() {
    const { selectedItemID } = this.context;
    /* Determine locked from lastSelectedItemID rather than current selectedItemID so that it doesn't 
    switch during button fade animation */
    const locked = this.state.lastSelectedItemID
      ? this.roomObject.roomItems.get(this.state.lastSelectedItemID)
          .movementLocked
      : false;
    // Determine whether or not a boundary point is currently selected
    const boundaryPointSelected =
      this.state.editingBounds &&
      this.roomObject.bounds.selectedPointIndex !== null;

    const canDeleteSelectedPoint =
      this.roomObject === undefined
        ? false
        : this.roomObject.bounds.pointsLength > 3;

    return (
      <div className="room-editor">
        <div className="room-editor-overlay">
          <div className="room-editor-toolbar">
            <div className="room-editor-toolbar-left">
              {this.state.editingBounds ? (
                boundaryPointSelected ? (
                  <>
                    <div className="room-editor-point-viewer">
                      <div>
                        <input
                          value={this.state.selectedPointX}
                          type="number"
                          name="selectedPointX"
                          placeholder="X"
                          onChange={this.onPointInputChanged}
                        />
                        <input
                          value={this.state.selectedPointY}
                          type="number"
                          name="selectedPointY"
                          placeholder="Y"
                          onChange={this.onPointInputChanged}
                        />
                      </div>
                      <button
                        className="room-editor-point-delete-btn"
                        onClick={this.onClickDeleteSelectedPoint}
                        disabled={!canDeleteSelectedPoint}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                ) : null
              ) : (
                <>
                  <IconButton
                    className="room-editor-toolbar-btn"
                    onClick={this.lockSelectedItem}
                    data-hidden={selectedItemID === null ? "true" : "false"}
                  >
                    {locked ? <BiLockAlt /> : <BiLockOpenAlt />}
                  </IconButton>
                  <IconButton
                    className="room-editor-toolbar-btn"
                    onClick={this.rotateSelectedItem}
                    disabled={locked}
                    data-hidden={selectedItemID === null ? "true" : "false"}
                  >
                    <RiClockwiseLine />
                  </IconButton>
                </>
              )}
            </div>
            <div className="room-editor-toolbar-right">
              {this.state.editingBounds ? (
                <>
                  <IconButton
                    className="room-editor-toolbar-btn room-editor-toolbar-btn-success"
                    onClick={() => {
                      this.toggleEditingBounds(true);
                    }}
                  >
                    <BsCheck />
                  </IconButton>
                  <IconButton
                    className="room-editor-toolbar-btn room-editor-toolbar-btn-danger"
                    onClick={() => {
                      this.toggleEditingBounds(false);
                    }}
                  >
                    <BsX />
                  </IconButton>
                </>
              ) : (
                <IconButton
                  className="room-editor-toolbar-btn"
                  onClick={() => {
                    this.toggleEditingBounds();
                  }}
                  style={{ padding: "9px" }}
                >
                  <BsBoundingBox />
                </IconButton>
              )}
            </div>
          </div>
          <div className="room-editor-footer">
            <span>1 Cell = 1 Square Foot</span>
          </div>
          <div className="room-editor-corner-controls">
            <IconButton
              onClick={() => {
                if (this.roomObject !== undefined) {
                  // Scale about the center of the canvas
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
                  // Scale about the center of the canvas
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
