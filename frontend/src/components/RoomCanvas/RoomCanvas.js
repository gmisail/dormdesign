import React, { Component } from "react";
import "./RoomCanvas.css";
import SceneController from "../../room-editor/SceneController";
import RoomObject from "../../room-editor/RoomObject";
import Vector2 from "../../room-editor/Vector2";

class RoomCanvas extends Component {
  constructor(props) {
    super(props);

    this.state = {
      scene: undefined,
      roomObject: undefined,
    };
  }

  componentDidMount() {
    const scene = new SceneController([this.canvas1, this.canvas2]);
    scene.backgroundColor = "#ccc";

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
      backgroundColor: "#ccc",
      onObjectMoved: this.roomObjectUpdated,
    });
    scene.addObject(room);

    this.setState({
      scene: scene,
      roomObject: room,
    });
  }

  componentDidUpdate(prevProps) {
    // Find which items need to be added/removed. Use maps with item ids as keys to make lookup faster
    const oldMap = prevProps.editorData.objects ?? new Map();
    const newMap = this.props.editorData.objects ?? new Map();

    // Remove items in old but not new
    for (let [oldId, oldItemData] of oldMap) {
      if (!newMap.has(oldId)) {
        this.removeItemFromScene(oldItemData);
      }
    }
    // Add items in new but not old
    for (let [newId, newItemData] of newMap) {
      if (!oldMap.has(newId) || !this.state.scene.objects.has(newId)) {
        // Add new item
        const item = this.props.itemMap.get(newId);
        if (item) {
          this.addItemToScene(item, newItemData);
        } else {
          console.error(
            `Error adding item to scene. Couldn't get item data for id ${newId}`
          );
        }
      } else {
        // Update existing items' data
        const item = this.props.itemMap.get(newId);
        this.updateRoomObject({
          id: newId,
          item: item,
          itemEditorData: newItemData,
        });
      }
    }
  }

  // Takes in editor data for object and tries to update the corresponding object in the editor scene
  updateRoomObject(args) {
    const { id, item, itemEditorData, sceneObject } = args;

    // If no scene object provided, try and get it from the scene by id
    const obj = sceneObject ?? this.state.scene.objects.get(id);
    if (!obj) {
      console.error(
        `Error updating object with id ${id}. Couldn't find corresponding scene object with matching id.`
      );
      return;
    }
    this.state.roomObject.updateRoomItem(id, {
      position: itemEditorData.position,
      name: item.name,
      width: item.dimensions.w,
      height: item.dimensions.l,
    });
  }

  // Called when object is moved in room.
  roomObjectUpdated = (obj) => {
    const updated = {
      id: obj.id,
      position: obj.position,
    };

    /* TODO: Make call to server either through data controller or sockets */

    // For testing just update local object map with new position
    this.props.editorData.objects.set(updated.id, updated.position);
  };

  // Adds item to editor. Takes in item reference and reference to editor data for item
  addItemToScene = (item, itemData) => {
    const newObj = this.state.roomObject.addItemToRoom({
      id: item.id,
      name: item.name,
      feetWidth: item.dimensions.w,
      feetHeight: item.dimensions.l,
      position: itemData.position,
    });

    // Update editor data with new position set by the room (should be in center of room by default)

    /* TODO: Make call to server either through data controller or sockets */

    // For testing just update local object map with new position
    this.props.editorData.objects.set(newObj.id, newObj.position);

    return newObj;
  };

  // Removed item from editor. Just takes in item reference
  removeItemFromScene = (item) => {
    this.state.roomObject.removeItemFromRoom(item.id);
  };

  render() {
    return (
      <div className="room-canvas-container mx-auto">
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
