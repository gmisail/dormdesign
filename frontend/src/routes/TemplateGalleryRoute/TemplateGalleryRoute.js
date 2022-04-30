import "./TemplateGalleryRoute.scss";

import React, { useState, useEffect } from "react";

import { BsThreeDotsVertical, BsLink45Deg } from "react-icons/bs";

import DataRequests from "../../controllers/DataRequests";

import RoomThumbnail from "../../components/RoomThumbnail/RoomThumbnail";
import RoomThumbnailGrid from "../../components/RoomThumbnailGrid/RoomThumbnailGrid";
import DropdownMenu from "../../components/DropdownMenu/DrowndownMenu";

export const TemplateGalleryRoute = () => {
  const [templates, setTemplates] = useState(null);

  useEffect(async () => {
    document.title = `DormDesign | Templates`;

    try {
      const templates = await DataRequests.getFeaturedTemplates();
      setTemplates(templates);
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <>
      <div className="templates-container custom-card">
        <RoomThumbnailGrid
          loadingSpinner={true}
          header={<h3>Featured Templates</h3>}
          emptyMessage="Sorry, looks like we don't have any featured templates at the moment. Check back later."
        >
          {templates === null
            ? null
            : templates.map((template, index) => (
                <RoomThumbnail
                  dropdownMenu={
                    <DropdownMenu placement={"bottom-start"} buttonIcon={<BsThreeDotsVertical />}>
                      <DropdownMenu.Item
                        icon={<BsLink45Deg />}
                        text={"Copy link"}
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/template/${template.templateId}`
                          );
                        }}
                      />
                    </DropdownMenu>
                  }
                  key={index}
                  name={template.name}
                  id={template.templateId}
                  isTemplate={true}
                />
              ))}
        </RoomThumbnailGrid>
      </div>
    </>
  );
};
