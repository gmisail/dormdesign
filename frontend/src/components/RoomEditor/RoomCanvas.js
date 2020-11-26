import React, { Component } from "react";
import "./RoomCanvas.scss";
import SceneController from "../../room-editor/SceneController";
import RoomEditorObject from "../../room-editor/RoomEditorObject";
import Vector2 from "../../room-editor/Vector2";
import EventController from "../../controllers/EventController";
import IconButton from "../IconButton/IconButton";
import { BsArrowClockwise, BsUnlock, BsLock } from "react-icons/bs";

// Converts DormItem properties to properties expected by RoomEditorObject
function itemToEditorProperties(props) {
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
  };
}

// Converts (relevant) editor properties to properties expected by DormItem
function editorToItemProperties(props) {
  return {
    editorPosition: props.position
      ? { x: props.position.x, y: props.position.y }
      : undefined,
    editorRotation: props.rotation,
    editorLocked: props.movementLocked,
    editorZIndex: props.zIndex,
  };
}

class RoomCanvas extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedItemLocked: false,
    };

    this.visibleItemsMap = new Map();
  }

  componentDidMount() {
    const scene = new SceneController([this.canvas1, this.canvas2]);
    scene.backgroundColor = "#fff";

    // Points defining the edges of the room (in feet)
    const testBoundaryPath = [
      new Vector2(1, 2),
      new Vector2(2, 2),
      new Vector2(2, 1),
      new Vector2(7.3, 1),
      new Vector2(7.3, 2),
      new Vector2(8, 2),
      new Vector2(8, 5),
      new Vector2(9, 5),
      new Vector2(9, 6),
      new Vector2(8, 6),
      new Vector2(8, 13),
      new Vector2(4, 13),
      new Vector2(4, 6.5),
      new Vector2(0, 6.5),
      new Vector2(0, 4),
      new Vector2(3, 4),
      new Vector2(3, 3),
      new Vector2(0, 3),
      new Vector2(0, -5),
      new Vector2(1, -5),
    ];
    const room = new RoomEditorObject({
      scene: scene,
      boundaryPoints: testBoundaryPath,
      canvasLayer: 1,
      backgroundColor: "#fff",
      onObjectsUpdated: this.editorItemsUpdated,
      onObjectSelected: this.editorItemSelected,
      selectedObjectID: undefined,
      fontFamily: "Source Sans Pro",
    });
    scene.addObject(room);

    this.scene = scene;
    this.roomEditor = room;

    this.updateVisibleItems(this.props.items);

    /*
      Listen to "itemsUpdated" in order to check if the currently selected item had properties (like editorLocked) changed that 
      require a state update
    */
    EventController.on("itemsUpdated", (payload) => {
      for (let i = 0; i < payload.items.length; i++) {
        const item = payload.items[i];
        if (item.id === this.props.selectedItemID) {
          const locked = item.updated.editorLocked;
          if (locked === undefined) return;
          if (this.state.selectedItemLocked !== locked) {
            this.setState({ selectedItemLocked: locked });
          }
        }
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    // If any of these cases apply, no need to update visible items
    if (prevState.selectedItemLocked !== this.state.selectedItemLocked) {
      return;
    }
    this.updateVisibleItems(this.props.items);
  }

  // Sorts through passed in items and adds, removes, and updates them from the editor and this.visibleItemsMap
  updateVisibleItems(items) {
    // Filter out items with visibleInEditor set to false
    const itemsToInclude = items.reduce((map, item) => {
      if (item.visibleInEditor) {
        map.set(item.id, item);
      }
      return map;
    }, new Map());

    // Check for objects to add and update existing objects
    for (let [key, item] of itemsToInclude) {
      if (!this.visibleItemsMap.has(key)) {
        // Put item in map and add it to the editor
        this.visibleItemsMap.set(key, item);
        const itemSceneObj = this.roomEditor.addItemToRoom(
          itemToEditorProperties(item)
        );
        // If item had no position, update item data with new position set by the editor (should be in center of room by default)
        if (!item.editorPosition) {
          item.editorPosition = {
            x: itemSceneObj.position.x,
            y: itemSceneObj.position.y,
          };
        }
      } else {
        // If item already in the editor, update its properties in case they changed
        this.roomEditor.updateRoomItem(item.id, itemToEditorProperties(item));
      }
    }

    // Check for objects that need to be deleted
    for (let key of this.visibleItemsMap.keys()) {
      if (!itemsToInclude.has(key)) {
        this.visibleItemsMap.delete(key);
        this.roomEditor.removeItemFromRoom(key);
      }
    }
  }

  /* 
    Called when object properties are updated in editor (e.g. position, rotation, movementLocked...). Takes in object ID and updated values and translates them to item
    property values. Then passes them up to callback passed from parent 
  */
  editorItemsUpdated = (objects) => {
    /* 
      Make sure editor objects have associated items. Translate updated objects array into array of updated items. 
      So translate this:
      [
        id: object id     
        updated: object properties updated      
      ]
      to this:
      [
        item: item reference
        updated: item properties updated
      ]
    */
    const validItems = objects.reduce((validArray, obj) => {
      const item = this.visibleItemsMap.get(obj.id);
      if (item === undefined) {
        console.error("Unable to find item associated with ID: ", obj.id);
      } else {
        validArray.push({
          item: item,
          updated: editorToItemProperties(obj.updated),
        });
      }
      return validArray;
    }, []);

    this.props.onItemsUpdated(validItems);
  };

  editorItemSelected = (obj) => {
    let item;
    if (obj) {
      item = this.visibleItemsMap.get(obj.id);
      if (!item) {
        console.error("Unable to find item associated with ID: ", obj.id);
        return;
      }
    }
    const locked = item?.editorLocked ?? false;
    if (this.state.selectedItemLocked !== locked) {
      this.setState({ selectedItemLocked: locked });
    }
    this.props.onItemSelected(item);
  };

  // Called when rotate button in toolbar is clicked
  rotateSelectedObject = () => {
    const selectedID = this.props.selectedItemID;
    if (!selectedID) return;

    const obj = this.scene.objects.get(selectedID);
    obj.rotateBy(90);
    this.editorItemsUpdated([
      {
        id: selectedID,
        updated: {
          rotation: obj.rotation,
        },
      },
    ]);
  };

  // Called when lock button in toolbar is clicked
  lockSelectedObject = () => {
    const selectedID = this.props.selectedItemID;
    if (!selectedID) return;
    const value = !this.scene.objects.get(selectedID).movementLocked;
    this.roomEditor.updateRoomItem(selectedID, {
      movementLocked: value,
    });
    this.editorItemsUpdated([
      {
        id: selectedID,
        updated: {
          movementLocked: value,
        },
      },
    ]);
    this.setState({ selectedItemLocked: value });
  };

  render() {
    const { selectedItemLocked } = this.state;
    const { selectedItemID } = this.props;

    return (
      <div className="room-canvas-container">
        <div className="room-editor-toolbar">
          <IconButton
            onClick={this.lockSelectedObject}
            disabled={selectedItemID === undefined}
            style={{ fontSize: "0.95em" }}
          >
            {selectedItemLocked ? <BsLock></BsLock> : <BsUnlock></BsUnlock>}
          </IconButton>
          <IconButton
            onClick={this.rotateSelectedObject}
            disabled={selectedItemID === undefined}
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
        <div className="room-canvas-footer">
          <span>1 Cell = 1 Square Foot</span>
        </div>
      </div>
    );
  }
}

export default RoomCanvas;