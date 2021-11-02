import React, { useEffect, useState } from "react";

import DataRequests from "../../controllers/DataRequests";

export default function RoomPreview({ id }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    async function generatePreview() {
      let data;
      try {
        data = await DataRequests.generatePreview(id);
        setUrl(data.url);
      } catch (err) {
        console.error(err);
      }
    }

    generatePreview();
  }, [id]);

  return <img className="room-preview-image" src={url} alt="Room Preview"></img>;
}
