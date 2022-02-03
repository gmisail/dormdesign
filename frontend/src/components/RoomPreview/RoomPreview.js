import React, { useEffect, useState } from "react";

import DataRequests from "../../controllers/DataRequests";
import "./RoomPreview.scss";

export default function RoomPreview({ preview, className }) {
  return <img className={`${className} room-preview-image`} src={preview} alt="Room Preview"></img>;
}
