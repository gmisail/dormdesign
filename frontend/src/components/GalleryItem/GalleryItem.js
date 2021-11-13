import "./GalleryItem.scss";

import React from "react";
import RoomPreview from "../RoomPreviewCard/RoomPreview";

const GalleryItem = (props) => {
  const { roomName, id, preview } = props;

  return (
    <a href={`/room/${id}`} className="gallery-card">
      <span className="gallery-card-name">{roomName}</span>
      <RoomPreview preview={preview} />
    </a>
  );
};

export default GalleryItem;
