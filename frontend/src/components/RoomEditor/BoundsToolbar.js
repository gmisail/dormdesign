import React from "react";

export default function BoundsToolbar({
  canDeleteSelectedPoint,
  selectedPointX,
  selectedPointY,
  onPointInputChanged,
  onClickDeleteSelectedPoint,
}) {  
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
