import "./RoomPreviewCard.scss";

import React from "react";
import RoomPreview from "./RoomPreview";
import IconButton from "../IconButton/IconButton";
import { BsX } from "react-icons/bs";

const RoomPreviewCard = (props) => {
  const { roomName, id, preview } = props;

  return (
    <div className="room-preview-card">
      <IconButton className="remove-button">
        <BsX />
      </IconButton>
      <a href={`/room/${id}`} className="">
        <span className="room-preview-name">{roomName}</span>
        <RoomPreview preview={preview} />
      </a>
    </div>
  );
};

export default RoomPreviewCard;
