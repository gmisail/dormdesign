import "./GalleryRoute.scss";

import React, { useState } from "react";

import SingleInputForm from "../../components/SingleInputForm/SingleInputForm";
import GalleryItem from "../../components/GalleryItem/GalleryItem";
import { useEffect } from "react";

export const GalleryRoute = () => {
  const rooms = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  const [isFeatured, setFeatured] = useState(true);

  useEffect(() => console.log(isFeatured ? "featured" : "community"), [isFeatured]);

  return (
    <div className="gallery-container">
      <div className="gallery-pages">
        <button
          className="custom-btn custom-btn-outline gallery-page gallery-btn-featured"
          type="submit"
          onClick={() => {
            if (!isFeatured) setFeatured(true);
          }}
        >
          Featured
        </button>
        <button
          className="custom-btn custom-btn-outline gallery-page gallery-btn-community"
          type="submit"
          onClick={() => {
            if (isFeatured) setFeatured(false);
          }}
        >
          Community
        </button>
      </div>
      <div className="gallery-toolbar">
        <SingleInputForm
          initialValue={""}
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
