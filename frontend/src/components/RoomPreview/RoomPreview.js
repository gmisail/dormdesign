import React, { useEffect, useState } from "react";

import { Spinner } from "react-bootstrap";
import { BsExclamationCircle } from "react-icons/bs";

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

  const error = !loadingPreview && preview === null;
  return (
    <div
      className={`${className ?? ""} room-preview ${loadingPreview ? "loading" : ""} ${
        error ? "room-preview-error" : ""
      }`}
    >
      {loadingPreview ? (
        <Spinner animation="border" variant="secondary" />
      ) : error ? (
        <>
          <BsExclamationCircle />
          <p>Room not found</p>
        </>
      ) : (
        <img className="room-preview-image" src={preview} alt="Room Preview"></img>
      )}
    </div>
  );
}
