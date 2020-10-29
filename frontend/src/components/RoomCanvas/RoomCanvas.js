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
    // Filter out items not included in editor
    const includedItems = [...this.props.itemMap.values()].filter(
      (item) => item.visibleInEditor
    );

    // Sort included items and currently added objects by id
    const items = includedItems.sort((a, b) => {
      return a.id - b.id;
    });
    const addedObjects = [...this.state.roomObject.roomItems].sort();

    // Iterate through both sorted lists simultaneously and find objects that need to be added/removed
    let i = 0;
    let j = 0;
    while (i < items.length || j < addedObjects.length) {
      const a = i < items.length ? items[i].id : undefined;
      const b = j < addedObjects.length ? addedObjects[j] : undefined;
      if (!b || a < b) {
        this.addItemToScene(items[i]);
        i++;
      } else if (!a || a > b) {
        this.removeItemFromScene(b);
        j++;
      } else {
        // Update item in case its properties changed
        this.updateRoomObject(a);
        i++;
        j++;
      }
    }
  }

  // Takes in item ID and tries to update the corresponding object in the editor scene
  updateRoomObject = (id) => {
    const item = this.props.itemMap.get(id);
    if (!item) {
      console.error(
        `ERROR Updating item in room editor. Invalid item ID: ${id}`
      );
    }
    // Try and fetch corresponding scene object
    const obj = this.state.scene.objects.get(id);
    if (!obj) {
      console.error(
        `ERROR updating object with id ${id}. Couldn't find corresponding scene object with matching id.`
      );
      return;
    }
    this.state.roomObject.updateRoomItem(id, {
      position: item.editorPosition,
      name: item.name,
      width: item.dimensions.width,
      height: item.dimensions.length, // Since editor is 2D, use length for Y dimension
    });
  };

  // Called when object is moved in room. Updates item's position and calls callback function
  roomObjectUpdated = (obj) => {
    const updated = {
      id: obj.id,
      position: obj.position,
    };

    const item = this.props.itemMap.get(updated.id);

    if (item) {
      item.editorPosition = updated.position;
    }

    if (this.props.onItemUpdate) {
      this.props.onItemUpdate(item);
    }
  };

  // Adds item to editor. Takes in item reference and reference to editor data for item
  addItemToScene = (item) => {
    const newObj = this.state.roomObject.addItemToRoom({
      id: item.id,
      name: item.name,
      feetWidth: item.dimensions.width,
      feetHeight: item.dimensions.length,
      position: item.editorPosition,
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
