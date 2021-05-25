import "./RoomPreviewCard.scss";

import React from "react";
import RoomPreview from "./RoomPreview";

const RoomPreviewCard = (props) => {
  const { roomName, id } = props;

  return (
    <a href={`/room/${id}`} className="room-preview-card">
      <span className="room-preview-name">{roomName}</span>
      <RoomPreview id={id} />
    </a>
  );
};

export default RoomPreviewCard;
