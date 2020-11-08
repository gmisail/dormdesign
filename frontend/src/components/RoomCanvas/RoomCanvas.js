import React, { Component } from "react";
import "./RoomCanvas.css";
import SceneController from "../../room-editor/SceneController";
import RoomObject from "../../room-editor/RoomObject";
import Vector2 from "../../room-editor/Vector2";
import EventController from "../../controllers/EventController";
import IconButton from "../IconButton/IconButton";
import { BsArrowClockwise, BsX, BsUnlock, BsLock } from "react-icons/bs";

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
      onObjectMoved: this.roomRectObjectUpdated,
      onObjectSelected: this.roomRectObjectSelected,
      selectedObjectID: undefined,
    });
    scene.addObject(room);

    this.setState({
      scene: scene,
      roomObject: room,
      visibleItemsMap: new Map(),
    });

    EventController.on("itemPositionUpdated", (payload) => {
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
    // Filter out items not included in editor
    const includedItems = this.props.items.filter(
      (item) => item.visibleInEditor
    );

    // Sort included items and currently added objects by id
    const items = includedItems.sort((a, b) => {
      return a.id < b.id;
    });
    const addedObjects = [...this.state.roomObject.roomItems].sort((a, b) => {
      return a < b;
    });

    // Map that will be filled with references to all items that are part of editor
    const visibleItemsMap = this.state.visibleItemsMap;
    visibleItemsMap.clear();

    // Iterate through both sorted lists simultaneously and find objects that need to be added/removed
    let i = 0;
    let j = 0;
    while (i < items.length || j < addedObjects.length) {
      const a = i < items.length ? items[i].id : undefined;
      const b = j < addedObjects.length ? addedObjects[j] : undefined;
      if (!b || a < b) {
        this.addItemToScene(items[i]);
        visibleItemsMap.set(items[i].id, items[i]);
        i++;
      } else if (!a || a > b) {
        this.removeItemFromScene(b);
        j++;
      } else {
        // Update item in case its properties changed
        this.updateRoomObject(items[i]);
        visibleItemsMap.set(items[i].id, items[i]);
        i++;
        j++;
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
    });
  };

  // Called when object is moved in room. Updates item's position and calls callback function
  roomRectObjectUpdated = (obj) => {
    const item = this.state.visibleItemsMap.get(obj.id);

    if (item) {
      item.editorPosition = obj.position;
      if (this.props.onItemPositionUpdated) {
        this.props.onItemPositionUpdated(item);
      }
    } else {
      console.error(
        "ERROR Unable to find item associated with SceneObject: ",
        obj
      );
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
      this.state.scene.objects.get(this.state.selectedObjectID).rotateBy(90);
    }
  };

  lockSelectedObject = () => {
    const value = !this.state.scene.objects.get(this.state.selectedObjectID)
      .movementLocked;
    this.state.roomObject.updateRoomItem(this.state.selectedObjectID, {
      movementLocked: value,
    });
    this.setState({ lockIcon: value });
  };

  // Sets selected item's visibleInEditor property to false
  hideSelectedObject = () => {
    console.log("Hide button clicked");
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
          <IconButton
            onClick={this.hideSelectedObject}
            disabled={
              this.state.selectedObjectID === undefined || this.state.lockIcon
            }
          >
            <BsX></BsX>
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
