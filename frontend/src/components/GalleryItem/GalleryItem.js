import "./GalleryItem.scss";

import React from "react";

const GalleryItem = (props) => {
  const { roomName, id, preview } = props;

  return (
    <div className="gallery-card">
      <a href={`/room/${id}`}>
        <span className="gallery-card-name">{roomName}</span>
      </a>
    </div>
  );
};

export default GalleryItem;
