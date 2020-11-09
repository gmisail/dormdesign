import React, { Component } from "react";
import "./RoomCanvas.css";
import SceneController from "../../room-editor/SceneController";
import RoomObject from "../../room-editor/RoomObject";
import Vector2 from "../../room-editor/Vector2";
import EventController from "../../controllers/EventController";
import IconButton from "../IconButton/IconButton";
import { BsArrowClockwise, BsX, BsUnlock, BsLock } from "react-icons/bs";
import DormItem from "../../models/DormItem";

class RoomCanvas extends Component {
  constructor(props) {
    super(props);

    this.state = {
      scene: undefined,
      roomObject: undefined,
      lockIcon: false,
    };
  }

  componentDidMount() {
    const scene = new SceneController([this.canvas1, this.canvas2]);
    scene.backgroundColor = "#fff";

    // Points defining the edges of the room (in feet)
    const testBoundaryPath = [
      new Vector2(0, 0),
      new Vector2(7.3, 0),
      new Vector2(7.3, 1.2),
      new Vector2(8, 1.2),
      new Vector2(8, 5),
      new Vector2(9, 5),
      new Vector2(9, 6),
      new Vector2(8, 6),
      new Vector2(8, 13),
      new Vector2(4, 13),
      new Vector2(4, 6.5),
      new Vector2(0, 6.5),
    ];
    const room = new RoomObject({
      scene: scene,
      boundaryPoints: testBoundaryPath,
      canvasLayer: 1,
      backgroundColor: "#fff",
      onObjectUpdated: this.roomRectObjectUpdated,
      onObjectSelected: this.roomRectObjectSelected,
      selectedObjectID: undefined,
    });
    scene.addObject(room);

    this.setState({
      scene: scene,
      roomObject: room,
      visibleItemsMap: new Map(),
    });

    EventController.on("itemUpdatedInEditor", (payload) => {
      room.updateRoomItem(payload.id, {
        position: payload.editorPosition,
      });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    // If the state change was the selected object, then return early since included items didn't change
    if (prevState.selectedObjectID !== this.state.selectedObjectID) {
      return;
    }
    // Filter out items with visibleInEditor set to false
    const itemsToInclude = this.props.items.reduce((map, item) => {
      if (item.visibleInEditor) {
        map.set(item.id, item);
      }
      return map;
    }, new Map());

    const visibleItemsMap = this.state.visibleItemsMap;

    // Check for objects to add and update existing objects
    for (let [key, value] of itemsToInclude) {
      if (!visibleItemsMap.has(key)) {
        visibleItemsMap.set(key, value);
        this.addItemToScene(value);
      } else {
        this.updateRoomObject(value);
      }
    }

    // Check for objects that need to be deleted
    for (let key of visibleItemsMap.keys()) {
      if (!itemsToInclude.has(key)) {
        visibleItemsMap.delete(key);
        this.removeItemFromScene(key);
      }
    }

    // If selected item is no longer in room, update state
    if (
      this.state.selectedObjectID !== undefined &&
      visibleItemsMap.get(this.state.selectedObjectID) === undefined
    ) {
      this.setState({ selectedObjectID: undefined });
    }
  }

  // Takes in item and tries to update the corresponding object in the editor scene
  updateRoomObject = (item) => {
    this.state.roomObject.updateRoomItem(item.id, {
      position: item.editorPosition,
      name: item.name,
      width: item.dimensions.width,
      height: item.dimensions.length, // Since editor is 2D, use length for Y dimension
      rotation: item.editorRotation,
      movementLocked: item.editorLocked,
    });
  };

  /* Called when object properties are updated in editor (e.g. position, rotation, movementLocked...). Takes in object ID
  and updated values. Sends update event to server and updates local item values */
  roomRectObjectUpdated = (id, updated) => {
    const item = this.state.visibleItemsMap.get(id);

    if (item) {
      // Need to translate updated obj since it has different property name (e.g. 'position' instead of 'editorPosition')
      const translatedUpdated = {
        editorPosition: updated.position,
        editorRotation: updated.rotation,
        editorLocked: updated.movementLocked,
      };
      item.update(translatedUpdated);
      this.props.socketConnection.send({
        event: "updateItemInEditor",
        sendResponse: false,
        data: {
          itemID: item.id,
          updated: translatedUpdated,
        },
      });
    } else {
      console.error("ERROR Unable to find item associated with ID: ", id);
    }
  };

  // Called when object is selected in room. Receives 'undefined' if currently selected object is deselected (without another one being selected)
  roomRectObjectSelected = (obj) => {
    this.setState({
      selectedObjectID: obj?.id,
      lockIcon: obj?.movementLocked ? true : false,
    });
  };

  // Adds item to editor. Takes in item reference and reference to editor data for item
  addItemToScene = (item) => {
    const newObj = this.state.roomObject.addItemToRoom({
      id: item.id,
      name: item.name,
      feetWidth: item.dimensions.width,
      feetHeight: item.dimensions.length,
      position: item.editorPosition,
      rotation: item.editorRotation,
      movementLocked: item.editorLocked,
    });
    // If item had no position, update item data with new position set by the room (should be in center of room by default)
    if (!item.editorPosition) {
      item.editorPosition = newObj.position;
    }

    return newObj;
  };

  // Removed item from editor. Just takes in item reference
  removeItemFromScene = (id) => {
    this.state.roomObject.removeItemFromRoom(id);
  };

  rotateSelectedObject = () => {
    if (this.state.selectedObjectID !== undefined) {
      const obj = this.state.scene.objects.get(this.state.selectedObjectID);
      obj.rotateBy(90);
      this.roomRectObjectUpdated(this.state.selectedObjectID, {
        rotation: obj.rotation,
      });
    }
  };

  lockSelectedObject = () => {
    const value = !this.state.scene.objects.get(this.state.selectedObjectID)
      .movementLocked;
    this.state.roomObject.updateRoomItem(this.state.selectedObjectID, {
      movementLocked: value,
    });
    this.roomRectObjectUpdated(this.state.selectedObjectID, {
      movementLocked: value,
    });
    this.setState({ lockIcon: value });
  };

  render() {
    return (
      <div className="card room-canvas-container">
        <div className="room-editor-toolbar">
          <IconButton
            onClick={this.lockSelectedObject}
            disabled={this.state.selectedObjectID === undefined}
            style={{ fontSize: "0.95em" }}
          >
            {this.state.lockIcon ? <BsLock></BsLock> : <BsUnlock></BsUnlock>}
          </IconButton>
          <IconButton
            onClick={this.rotateSelectedObject}
            disabled={
              this.state.selectedObjectID === undefined || this.state.lockIcon
            }
          >
            <BsArrowClockwise></BsArrowClockwise>
          </IconButton>
        </div>
        <canvas
          ref={(ref) => (this.canvas1 = ref)}
          className="room-canvas"
          style={{ zIndex: 1 }}
        ></canvas>
        <canvas
          ref={(ref) => (this.canvas2 = ref)}
          className="room-canvas"
          style={{ zIndex: 2 }}
        ></canvas>
      </div>
    );
  }
}

export default RoomCanvas;
