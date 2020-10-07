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
    const oldMap = new Map(prevProps.items.map((item) => [item.id, item]));
    const newMap = new Map(this.props.items.map((item) => [item.id, item]));
    // Remove items in old but not new
    for (let [oldId, oldItem] of oldMap) {
      if (!newMap.has(oldId)) {
        this.removeItemFromScene(oldItem);
      }
    }
    // Add items in new but not old
    for (let [newId, newItem] of newMap) {
      if (!oldMap.has(newId)) {
        this.addItemToScene(newItem);
      }
    }
  }

  /*
  Takes in array of object updates with format:
  {
    id,
    position
  }
  */
  updateRoomObjects(updatedObjects) {
    for (let i = 0; i < updatedObjects.length; i++) {
      const updated = updatedObjects[i];
      const obj = this.state.scene.objects.get(updated.id);
      if (obj) {
        obj.position = updated.position;
      }
    }
  }

  // Called when object is moved in room
  roomObjectUpdated(obj) {
    const updated = {
      id: obj.id,
      position: obj.position,
    };
    console.log(updated);
  }

  addItemToScene = (item) => {
    this.state.roomObject.addItemToRoom({
      id: item.id,
      name: item.name,
      feetWidth: item.dimensions.w,
      feetHeight: item.dimensions.l,
      position: item.editor.position
        ? new Vector2(item.editor.position.x, item.editor.position.y)
        : undefined,
    });
  };

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
