import React, { useEffect, useState } from "react";

import DataRequests from "../../controllers/DataRequests";

export default function RoomPreview({ preview }) {
  return <img className="room-preview-image" src={preview} alt="Room Preview"></img>;
}
