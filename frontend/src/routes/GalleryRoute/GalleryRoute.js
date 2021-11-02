import "../HomeRoute/HomeRoute.scss";

import React, { useCallback, useEffect } from "react";

import RoomPreviewCard from "../../components/RoomPreviewCard/RoomPreviewCard";

const NUM_COLS = 4;

export const GalleryRoute = () => {
  const createRow = (row) => {
    return (
      <div class="row">
        {row.map((card, id) => (
          <div class="col">
            <RoomPreviewCard key={id} id={0} roomName={"Test " + id} preview={""}></RoomPreviewCard>
          </div>
        ))}
      </div>
    );
  };

  const rooms = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const numRows = Math.ceil(rooms.length / NUM_COLS);

  let rows = [];
  for (let i = 0; i < numRows; i++) 
    rows.push(rooms.slice(i * NUM_COLS, i * NUM_COLS + NUM_COLS));

  return (
    <div className="recent-rooms">{ rows.map((row) => createRow(row)) }</div>
  );
};
