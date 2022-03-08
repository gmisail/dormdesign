import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";

import DataRequests from "../../controllers/DataRequests";
import "./RoomPreview.scss";

export default function RoomPreview({ id, isTemplate, className }) {
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(true);

  useEffect(async () => {
    try {
      const value = await DataRequests.generatePreview(id, isTemplate === true);
      setPreview(value);
    } catch (err) {
      console.error(err);
    }
    setLoadingPreview(false);
  }, [id]);

  return (
    <div className={`${className ?? ""} room-preview ${loadingPreview ? "loading" : ""}`}>
      {loadingPreview ? (
        <Spinner animation="border" variant="secondary" />
      ) : (
        <img src={preview} alt="Room Preview"></img>
      )}
    </div>
  );
}
