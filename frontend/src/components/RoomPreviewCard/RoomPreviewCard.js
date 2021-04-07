import React from "react";

import "./RoomPreviewCard.scss";

const ListItem = (props) => {
  const { roomName } = props;

  return (
    <a href={`/room/${props.id}`} className="room-preview-card">
      <span className="room-preview-name">{roomName}</span>
    </a>
  );
};

export default ListItem;
