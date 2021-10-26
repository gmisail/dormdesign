import "../HomeRoute/HomeRoute.scss";

import React, { useCallback, useEffect } from "react";

import RoomPreviewCard from "../../components/RoomPreviewCard/RoomPreviewCard";

const NUM_COLS = 3;

export const GalleryRoute = () => {
  const createRow = (row) => {
    return (
      <div class="row">
        {row.map((id) => (
          <div class="col">
            <RoomPreviewCard key={0} id={0} roomName={"test"} preview={""}></RoomPreviewCard>
          </div>
        ))}
      </div>
    );
  };

  const rooms = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const numRows = Math.ceil(rooms.length / NUM_COLS);

  let rows = [];
  for (let i = 0; i < numRows; i++) rows.push(rooms.slice(i * NUM_COLS, i * NUM_COLS + NUM_COLS));

  return rows.map((row) => createRow(row));
};
