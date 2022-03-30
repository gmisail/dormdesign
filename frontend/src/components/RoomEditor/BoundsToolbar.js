import React, { useState, useEffect } from "react";
import Vector2 from "../../room-editor/Vector2";

export default function BoundsToolbar({
  canDeleteSelectedPoint,
  selectedPoint,
  onUpdateSelectedPoint,
  onClickDeleteSelectedPoint,
}) {
  const [xValue, setXValue] = useState(selectedPoint.x);
  const [yValue, setYValue] = useState(selectedPoint.y);

  useEffect(() => {
    setXValue(selectedPoint.x);
    setYValue(selectedPoint.y);
  }, [selectedPoint]);

  const onPointInputChanged = (evt) => {
    let value = evt.target.value;
    const name = evt.target.name;
    if (value.length !== 0) {
      value = parseFloat(value);
      // Prevent really big/small values
      value = Math.min(Math.max(value, -500), 500);
      const editedPoint = new Vector2(xValue, yValue);
      if (name === "xValue") {
        editedPoint.x = value;
      } else {
        editedPoint.y = value;
      }
      onUpdateSelectedPoint(editedPoint);
    }

    if (name === "xValue") setXValue(value);
    else if (name === "yValue") setYValue(value);
  };

  return (
    <>
      <div className="room-editor-point-viewer">
        <div>
          <input
            value={xValue}
            type="number"
            name="xValue"
            placeholder="X"
            onChange={onPointInputChanged}
          />
          <input
            value={yValue}
            type="number"
            name="yValue"
            placeholder="Y"
            onChange={onPointInputChanged}
          />
        </div>
        <button
          className="room-editor-point-delete-btn"
          title="Delete Point"
          onClick={onClickDeleteSelectedPoint}
          disabled={!canDeleteSelectedPoint}
        >
          Delete
        </button>
      </div>
    </>
  );
}
