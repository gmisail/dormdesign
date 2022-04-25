import "./TemplateEditor.scss";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { itemSelected } from "../../../context/RoomStore";

import { MdFilterCenterFocus } from "react-icons/md";
import { RiRulerFill, RiRulerLine } from "react-icons/ri";
import { BiMinus, BiPlus } from "react-icons/bi";

import IconButton from "../../../components/IconButton/IconButton";
import RoomEditorObject from "../../../room-editor/RoomEditorObject";
import SceneController from "../../../room-editor/SceneController";
import Vector2 from "../../../room-editor/Vector2";

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
    // movemenetLocked is always true since templates are read-only
    movementLocked: true,
    zIndex: props.editorZIndex,
    visible: props.visibleInEditor,
  };
};

function TemplateEditor() {
  const dispatch = useDispatch();

  const [lastSelectedItemID, setLastSelectedItemID] = useState(null);
  // Start with edge lengths true since that is the default in RoomBoundsObject
  const [showEdgeLengths, setShowEdgeLengths] = useState(true);

  const scene = useRef(null);
  const room = useRef(null);
  const zoomScale = useRef(1.3);

  const mainCanvasRef = useRef(null);

  const items = useSelector((state) => state.items);
  const selectedItemID = useSelector((state) => state.selectedItemID);
  const bounds = useSelector((state) => state.bounds);

  useEffect(() => {
    if (!mainCanvasRef.current) return;

    scene.current = new SceneController(mainCanvasRef.current);
    scene.current.backgroundColor = "#fff";

    room.current = new RoomEditorObject({
      scene: scene.current,
      backgroundColor: "#fff",
      onObjectSelected: itemSelectedInEditor,
      selectedObjectID: undefined,
      fontFamily: "Source Sans Pro",
    });
    scene.current.addChild(room.current);

    zoomScale.current = 1.3;
  }, [mainCanvasRef]);

  useEffect(() => {
    for (let i = 0; i < items.length; i++) {
      const translatedItem = itemToEditorProperties(items[i]);
      room.current.addItemToRoom(translatedItem);
    }
  }, [items]);

  useEffect(() => {
    room.current.bounds.points = bounds;
    room.current.centerView();
  }, [bounds]);

  const itemSelectedInEditor = (obj) => {
    dispatch(itemSelected(obj === null ? null : obj.id));
    if (obj !== null) {
      setLastSelectedItemID(obj.id);
    }
  };

  return (
    <div className="room-editor">
      <div className="room-editor-overlay">
        <div className="room-editor-toolbar">
          <div className="room-editor-toolbar-left"></div>
          <div className="room-editor-toolbar-right">
            <IconButton
              className="room-editor-toolbar-btn"
              title="Toggle Edge Lengths"
              onClick={() => {
                if (room.current !== undefined) {
                  room.current.bounds.edgeLengths = !showEdgeLengths;
                  setShowEdgeLengths(!showEdgeLengths);
                }
              }}
            >
              {showEdgeLengths ? <RiRulerFill /> : <RiRulerLine />}
            </IconButton>
          </div>
        </div>
        <div className="room-editor-footer">
          <span>1 Cell = 1 Square Foot</span>
        </div>
        <div className="room-editor-corner-controls">
          <IconButton
            title="Zoom In"
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
            title="Center View"
            onClick={() => {
              if (room.current !== undefined) {
                room.current.centerView();
              }
            }}
          >
            <MdFilterCenterFocus />
          </IconButton>
          <IconButton
            title="Zoom Out"
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

export default TemplateEditor;
