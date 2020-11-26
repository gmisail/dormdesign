import React, { Component } from "react";
import { RoomContext, RoomActions } from "../../routes/RoomRoute/RoomContext";
import SceneController from "../../room-editor/SceneController";
import RoomEditorObject from "../../room-editor/RoomEditorObject";
import Vector2 from "../../room-editor/Vector2";
import IconButton from "../IconButton/IconButton";
import { BsArrowClockwise, BsUnlock, BsLock } from "react-icons/bs";
import "./RoomCanvas.scss";

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
      backgroundColor: "#fff",
      onObjectsUpdated: this.itemsUpdatedInEditor,
      // onObjectSelected: this.editorItemSelected,
      selectedObjectID: undefined,
      fontFamily: "Source Sans Pro",
    });
    scene.addChild(room);

    this.scene = scene;
    this.roomObject = room;
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

  componentDidUpdate() {
    const { editorActionQueue, clearEditorActionQueue } = this.context;
    for (let i = 0; i < editorActionQueue.length; i++) {
      const action = editorActionQueue[i];
      // console.log("EDITOR ACTION: ", action);
      switch (action.type) {
        case RoomActions.connectedToRoom:
          for (let i = 0; i < action.payload.data.length; i++) {
            const translatedItem = itemToEditorProperties(
              action.payload.data[i]
            );
            this.roomObject.addItemToRoom(translatedItem);
          }
          break;
        case RoomActions.itemsUpdated:
          for (let i = 0; i < action.payload.items.length; i++) {
            const id = action.payload.items[i].id;
            const updated = action.payload.items[i].updated;
            this.roomObject.updateRoomItem(id, itemToEditorProperties(updated));
          }
          console.log(
            this.roomObject.children.length,
            this.scene._objects.size
          );
          break;
        case RoomActions.itemAdded:
          console.log(
            "BEFORE",
            this.roomObject.children.length,
            this.scene._objects.size
          );
          this.roomObject.addItemToRoom(
            itemToEditorProperties(action.payload.item)
          );
          console.log("ADDED ITEM", action.payload.item);
          console.log(
            this.roomObject.children.length,
            this.scene._objects.size
          );
          break;
        case RoomActions.itemDeleted:
          this.roomObject.removeItemFromRoom(action.payload.id);
          console.log(
            this.roomObject.children.length,
            this.scene._objects.size
          );
          break;
      }
    }
    if (editorActionQueue.length > 0) {
      clearEditorActionQueue();
    }
  }

  // useEffect(() => {
  //   console.log("ROOMCANVAS BINDING EVENTS");
  //   events.on(RoomActions.connectedToRoom, (payload) => {
  //     for (let i = 0; i < payload.data.length; i++) {
  //       const translatedItem = itemToEditorProperties(payload.data[i]);
  //       editorRef.current.editor.addItemToRoom(translatedItem);
  //     }
  //   });

  //   events.on(RoomActions.itemsUpdated, (payload) => {
  //     for (let i = 0; i < payload.items.length; i++) {
  //       const id = payload.items[i].id;
  //       const updated = payload.items[i].updated;
  //       editorRef.current.editor.updateRoomItem(
  //         id,
  //         itemToEditorProperties(updated)
  //       );
  //     }
  //     console.log(
  //       editorRef.current.editor.children.length,
  //       editorRef.current.scene._objects.size
  //     );
  //   });

  //   events.on(RoomActions.itemAdded, (payload) => {
  //     editorRef.current.editor.addItemToRoom(payload.item);
  //     console.log(
  //       editorRef.current.editor.children.length,
  //       editorRef.current.scene._objects.size
  //     );
  //   });

  //   events.on(RoomActions.itemDeleted, (payload) => {
  //     editorRef.current.editor.removeItemFromRoom(payload.id);
  //     console.log(
  //       editorRef.current.editor.children.length,
  //       editorRef.current.scene._objects.size
  //     );
  //   });
  // }, [events]);

  // useEffect(() => {
  //   if (socketConnection === null) return;
  //   console.log("BINDING ROOMCANVAS SOCKET EVENTS");
  //   const editor = editorRef.current.editor;
  //   const scene = editorRef.current.scene;
  //   socketConnection.on("itemsUpdated", (data) => {
  //     for (let i = 0; i < data.items.length; i++) {
  //       const updatedItem = data.items[i];
  //       if (updatedItem.updated.visibleInEditor !== undefined) {
  //         if (updatedItem.updated.visibleInEditor === false) {
  //           editor.removeItemFromRoom(updatedItem.id);
  //         } else {
  //         }
  //       }
  //       const updated = editor.updateRoomItem(
  //         item.id,
  //         itemToEditorProperties(item)
  //       );
  //     }
  //   });

  //   socketConnection.on("itemAdded", (data) => {
  //     if (!scene.objects.has(data.id)) return;
  //     editor.addItemToRoom(itemToEditorProperties(data));
  //   });

  //   socketConnection.on("itemDeleted", (data) => {
  //     editor.removeItemFromRoom(id);
  //   });
  // }, [socketConnection]);

  // useEffect(() => {
  //   if (items === null) return;
  //   for (let i = 0; i < items.length; i++) {
  //     if (items[i].visibleInEditor) {

  //     }
  //   }
  // }, [items])

  // const updateItemInEditor = useCallback(
  //   (data) => {
  //     for (let i = 0; i < data.items.length; i++) {
  //       const updatedItem = data.items[i];
  //       if (updatedItem.updated.visibleInEditor !== undefined) {
  //         if (updatedItem.updated.visibleInEditor === false) {
  //           editor.removeItemFromRoom(updatedItem.id);
  //         } else {
  //           for (let j = 0; j < items.length; i++) {
  //             if (items[j].id === updatedItem.id) {
  //               items
  //             }
  //           }
  //         }
  //       }
  //       const updated = editor.updateRoomItem(
  //         item.id,
  //         itemToEditorProperties(item)
  //       );
  //     }
  //   },
  //   [items]
  // );
  render() {
    return (
      <div className="room-canvas-container">
        {/* <div className="room-editor-toolbar">
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
        </div> */}
        {/* <canvas
          ref={backgroundCanvasRef}
          className="room-canvas"
          style={{ zIndex: 1 }}
        ></canvas> */}
        <canvas
          ref={(ref) => (this.mainCanvasRef = ref)}
          className="room-canvas"
          style={{ zIndex: 1 }}
        ></canvas>
        <div className="room-canvas-footer">
          <span>1 Cell = 1 Square Foot</span>
        </div>
      </div>
    );
  }
}

export default RoomEditor;
