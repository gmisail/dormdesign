import "./GalleryRoute.scss";

import React, { useCallback, useEffect } from "react";

import GalleryItem from "../../components/GalleryItem/GalleryItem";

export const GalleryRoute = () => {
  const rooms = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  return (
    <div className="gallery-container">
      <div className="gallery-grid">
        {rooms.map((room) => (
          <GalleryItem key={0} id={0} roomName={"Test " + 0} preview={""} />
        ))}
      </div>
    </div>
  );
};
