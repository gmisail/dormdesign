import React, { useEffect, useState } from "react";

import DataRequests from "../../controllers/DataRequests";
import "./RoomPreview.scss";

export default function RoomPreview({ preview, className }) {
  return (
    <div className={`${className} room-preview-container`}>
      <img className="room-preview-image" src={preview} alt="Room Preview"></img>
    </div>
  );
}
