import "./GalleryRoute.scss";

import React, { useCallback, useEffect } from "react";

import SingleInputForm from "../../components/SingleInputForm/SingleInputForm"
import GalleryItem from "../../components/GalleryItem/GalleryItem";

export const GalleryRoute = () => {
  const rooms = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  return (
    <div className="gallery-container">
      <div className="gallery-pages">
        <button
          className="custom-btn custom-btn-outline gallery-page gallery-btn-featured"
          type="submit"
        >
          Featured
        </button>
        <button
          className="custom-btn custom-btn-outline gallery-page gallery-btn-community"
          type="submit"
        >
          Community
        </button>
      </div>
      <div className="gallery-toolbar">
        <SingleInputForm
          initialValue={"Hello"}
          submitButtonText={"Search"}
          submitButtonTextSuccessful={"Search"}
          onSubmit={(content) => console.log(content)}
          trim={true}
          allowEmptySubmit={false}
          maxLength={40}
        />
      </div>
      <div className="gallery-grid">
        {rooms.map((room) => (
          <GalleryItem key={0} id={0} roomName={"Test " + 0} preview={""} />
        ))}
      </div>
    </div>
  );
};
