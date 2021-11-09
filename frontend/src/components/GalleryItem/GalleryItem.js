import "./GalleryItem.scss";

import React from "react";
import RoomPreview from "../RoomPreviewCard/RoomPreview";

const GalleryItem = (props) => {
  const { roomName, id, preview } = props;

  return (
    <div className="gallery-card">
      <a href={`/room/${id}`}>
        <span className="gallery-card-name">{roomName}</span>
        <RoomPreview preview={preview} />
      </a>
      <button className="custom-btn" name="cloneRoom">
        Preview Template
      </button>
      <button className="custom-btn" name="cloneRoom">
        Create Room From Template
      </button>
    </div>
  );
};

export default GalleryItem;
