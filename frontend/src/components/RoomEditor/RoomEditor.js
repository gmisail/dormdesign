import "./RoomEditor.scss";

import { BiMinus, BiPlus } from "react-icons/bi";
import { BsBoundingBox, BsCheck, BsX } from "react-icons/bs";
import React, { useEffect, useRef, useState } from "react";
import {
  clearEditorActionQueue,
  itemSelected,
  updateBounds,
  updatedItems,
} from "../../context/RoomStore";
import { useDispatch, useSelector } from "react-redux";

import BoundsToolbar from "./BoundsToolbar";
import IconButton from "../IconButton/IconButton";
import ItemToolbar from "./ItemToolbar";
import { MdFilterCenterFocus } from "react-icons/md";
import RoomActions from "../../context/RoomActions";
import RoomEditorObject from "../../room-editor/RoomEditorObject";
import SceneController from "../../room-editor/SceneController";
import Vector2 from "../../room-editor/Vector2";

function RoomEditor() {
  const dispatch = useDispatch();

  const [lastSelectedItemID, setLastSelectedItemID] = useState(null);
  const [editingBounds, setEditingBounds] = useState(false);
  const [selectedPointX, setSelectedPointX] = useState("");
  const [selectedPointY, setSelectedPointY] = useState("");

  const scene = useRef(null);
  const room = useRef(null);
  const zoomScale = useRef(1.3);

  const mainCanvasRef = useRef(null);

  const editorActionQueue = useSelector((state) => state.editorActionQueue);
  const selectedItemID = useSelector((state) => state.selectedItemID);
  const bounds = useSelector((state) => state.bounds);

  // On page load, no items can be selected by default. Thus, no item can be locked.
  const [locked, setLocked] = useState(false);

  // The variables below don't need to be stored as state
  const boundaryPointSelected = editingBounds && room.current?.bounds.selectedPointIndex !== null;
  const canDeleteSelectedPoint =
    room.current === undefined ? false : room.current?.bounds.pointsLength > 3;

  useEffect(() => {
    if (!mainCanvasRef.current) return;

    scene.current = new SceneController(mainCanvasRef.current);
    scene.current.backgroundColor = "#fff";

    room.current = new RoomEditorObject({
      scene: scene.current,
      backgroundColor: "#fff",
      onObjectsUpdated: itemsUpdatedInEditor,
      onObjectSelected: itemSelectedInEditor,
      onBoundsUpdated: onBoundsUpdated,
      onBoundaryPointSelected: onBoundaryPointSelected,
      selectedObjectID: undefined,
      fontFamily: "Source Sans Pro",
    });

    scene.current.addChild(room.current);

    // Handle any actions that have accumlated in editorActionQueue
    handleEditorQueue();

    setLocked(
      lastSelectedItemID ? room.current.roomItems.get(lastSelectedItemID)?.movementLocked : false
    );

    zoomScale.current = 1.3;
  }, [mainCanvasRef]);

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
      editorPosition: props.position ? { x: props.position.x, y: props.position.y } : undefined,
      editorRotation: props.rotation,
      editorLocked: props.movementLocked,
      editorZIndex: props.zIndex,
    };
  };

  const handleEditorQueue = () => {
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
            const translatedItem = itemToEditorProperties(action.payload.items[i]);
            room.current.addItemToRoom(translatedItem);
          }
          room.current.bounds.points = action.payload.bounds;
          room.current.centerView();
          break;
        case RoomActions.itemsUpdated:
          for (let i = 0; i < action.payload.items.length; i++) {
            const id = action.payload.items[i].id;
            const updated = action.payload.items[i].updated;
            room.current.updateRoomItem(id, itemToEditorProperties(updated));

            if (id === lastSelectedItemID && updated.editorLocked !== undefined) {
              setLocked(updated.editorLocked);
            }
          }
          break;
        case RoomActions.itemAdded:
          room.current.addItemToRoom(itemToEditorProperties(action.payload.item));
          break;
        case RoomActions.itemDeleted:
          room.current.removeItemFromRoom(action.payload.id);
          break;
        case RoomActions.boundsUpdated:
          // If bounds are currently being edited, don't update them locally with external changes
          if (!editingBounds) {
            room.current.bounds.points = action.payload.bounds;
          }
          break;
        default:
          continue;
      }
    }

    if (editorActionQueue.length > 0) {
      dispatch(clearEditorActionQueue());
    }
  };

  const itemsUpdatedInEditor = (items) => {
    dispatch(
      updatedItems(
        items.map(({ id, updated }) => {
          return {
            id,
            updated: editorToItemProperties(updated),
          };
        })
      )
    );
  };

  const itemSelectedInEditor = (obj) => {
    dispatch(itemSelected(obj === null ? null : obj.id));
    if (obj !== null) {
      setLastSelectedItemID(obj.id);
      setLocked(obj.movementLocked);
    }
  };

  const rotateSelectedItem = () => {
    if (!selectedItemID) return;

    const sceneObj = room.current.roomItems.get(selectedItemID);
    sceneObj.rotation += 90;

    dispatch(
      updatedItems([
        {
          id: selectedItemID,
          updated: { editorRotation: sceneObj.rotation },
        },
      ])
    );
  };

  const lockSelectedItem = () => {
    if (!selectedItemID) return;

    const sceneObj = room.current?.roomItems.get(selectedItemID);
    sceneObj.movementLocked = !sceneObj.movementLocked;

    setLocked(sceneObj.movementLocked);

    dispatch(
      updatedItems([
        {
          id: selectedItemID,
          updated: {
            editorLocked: sceneObj.movementLocked,
          },
        },
      ])
    );
  };

  const onBoundaryPointSelected = (point) => {
    setSelectedPointX(point !== null ? point.x : "");
    setSelectedPointY(point !== null ? point.y : "");
  };

  const onClickDeleteSelectedPoint = () => {
    room.current.bounds.deletePointAtIndex(room.current.bounds.selectedPointIndex);
  };

  const onBoundsUpdated = (points) => {
    const selectedPointIndex = room.current.bounds.selectedPointIndex;

    if (selectedPointIndex !== null) {
      const selectedPoint = points[selectedPointIndex];
      setSelectedPointX(selectedPoint.x);
      setSelectedPointY(selectedPoint.y);
    }
  };

  const toggleEditingBounds = (saveEdits) => {
    const editing = !editingBounds;
    room.current.bounds.editing = editing;
    if (editing) {
      // editedBounds = room.current.bounds.points;
    } else {
      if (saveEdits) {
        // Save the edits made by updating the bounds
        dispatch(updateBounds(room.current.bounds.points));
      } else {
        // Don't save the edits, revert them to pre-edited state
        room.current.bounds.points = bounds;
      }
    }
    if (room.current.selectedObject) {
      room.current.selectItem(null);
    }

    setEditingBounds(editing);
  };

  useEffect(handleEditorQueue, [editorActionQueue]);

  return (
    <div className="room-editor">
      <div className="room-editor-overlay">
        <div className="room-editor-toolbar">
          <div className="room-editor-toolbar-left">
            {
              /* 
                if we are editing the boundaries and a point is selected, show the bounds toolbar. If not, show the 
                default item toolbar (lock, rotate, etc.)
              */
              editingBounds ? (
                boundaryPointSelected ? (
                  <BoundsToolbar
                    room={room}
                    canDeleteSelectedPoint={canDeleteSelectedPoint}
                    selectedPointX={selectedPointX}
                    selectedPointY={selectedPointY}
                    setSelectedPointX={setSelectedPointX}
                    setSelectedPointY={setSelectedPointY}
                    onClickDeleteSelectedPoint={onClickDeleteSelectedPoint}
                  />
                ) : null
              ) : (
                <ItemToolbar
                  lockSelectedItem={lockSelectedItem}
                  rotateSelectedItem={rotateSelectedItem}
                  selectedItemID={selectedItemID}
                  locked={locked}
                />
              )
            }
          </div>
          <div className="room-editor-toolbar-right">
            {editingBounds ? (
              <>
                <IconButton
                  className="room-editor-toolbar-btn room-editor-toolbar-btn-success"
                  onClick={() => {
                    toggleEditingBounds(true);
                  }}
                >
                  <BsCheck />
                </IconButton>
                <IconButton
                  className="room-editor-toolbar-btn room-editor-toolbar-btn-danger"
                  onClick={() => {
                    toggleEditingBounds(false);
                  }}
                >
                  <BsX />
                </IconButton>
              </>
            ) : (
              <IconButton
                className="room-editor-toolbar-btn"
                onClick={() => {
                  toggleEditingBounds();
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
              if (room.current !== undefined) {
                // Scale about the center of the canvas
                room.current.scaleAbout(
                  new Vector2(zoomScale.current, zoomScale.current),
                  new Vector2(scene.current.canvas.width / 2, scene.current.canvas.height / 2)
                );
              }
            }}
          >
            <BiPlus />
          </IconButton>
          <IconButton
            onClick={() => {
              if (room.current !== undefined) {
                room.current.centerView();
              }
            }}
          >
            <MdFilterCenterFocus />
          </IconButton>
          <IconButton
            onClick={() => {
              if (room.current !== undefined) {
                // Scale about the center of the canvas
                room.current.scaleAbout(
                  new Vector2(1 / zoomScale.current, 1 / zoomScale.current),
                  new Vector2(scene.current.canvas.width / 2, scene.current.canvas.height / 2)
                );
              }
            }}
          >
            <BiMinus />
          </IconButton>
        </div>
      </div>

      <canvas
        ref={(canvas) => {
          mainCanvasRef.current = canvas;
        }}
        className="room-canvas"
      ></canvas>
    </div>
  );
}

export default RoomEditor;
