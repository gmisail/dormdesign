import React from "react";
import Vector2 from "../../room-editor/Vector2";

export default function BoundsToolbar({
  room,
  canDeleteSelectedPoint,
  selectedPointX,
  selectedPointY,
  setSelectedPointX,
  setSelectedPointY,
  onClickDeleteSelectedPoint,
}) {
  const onPointInputChanged = (evt) => {
    let value = evt.target.value;
    const name = evt.target.name;
    if (value.length !== 0) {
      value = parseFloat(value);
      // Prevent really big/small values
      value = Math.min(Math.max(value, -500), 500);
      const editedPoint = new Vector2(selectedPointX, selectedPointY);
      if (name === "selectedPointX") {
        editedPoint.x = value;
      } else {
        editedPoint.y = value;
      }
      // Update edited point value in the scene
      room.current.bounds.setPointAtIndex(room.current.bounds.selectedPointIndex, editedPoint);
    }

    if (name === "selectedPointX") setSelectedPointX(value);
    else if (name === "selectedPointY") setSelectedPointY(value);
  };

  return (
    <>
      <div className="room-editor-point-viewer">
        <div>
          <input
            value={selectedPointX}
            type="number"
            name="selectedPointX"
            placeholder="X"
            onChange={onPointInputChanged}
          />
          <input
            value={selectedPointY}
            type="number"
            name="selectedPointY"
            placeholder="Y"
            onChange={onPointInputChanged}
          />
        </div>
        <button
          className="room-editor-point-delete-btn"
          onClick={onClickDeleteSelectedPoint}
          disabled={!canDeleteSelectedPoint}
        >
          Delete
        </button>
      </div>
    </>
  );
}
