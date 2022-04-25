import "./TemplateGalleryRoute.scss";

import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";

import { Spinner } from "react-bootstrap";

import RoomPreview from "../../components/RoomPreview/RoomPreview";
import DataRequests from "../../controllers/DataRequests";

export const TemplateGalleryRoute = () => {
  const [templates, setTemplates] = useState(null);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  const history = useHistory();

  useEffect(async () => {
    document.title = `DormDesign | Templates`;

    try {
      const templates = await DataRequests.getFeaturedTemplates();
      setTemplates(templates);
      setLoadingTemplates(false);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const onClickTemplate = (index) => {
    history.push(`/template/${templates[index].templateId}`);
  };

  return (
    <>
      <div className="templates-container">
        <h3>Featured Templates</h3>
        {loadingTemplates ? (
          <div className="templates-spinner">
            <Spinner animation="border" variant="secondary" />
          </div>
        ) : templates === null || templates.length === 0 ? (
          <p>No templates found</p>
        ) : (
          <div className="templates-grid">
            {templates.map((template, index) => (
              <button key={index} className="templates-card" onClick={() => onClickTemplate(index)}>
                <p className="templates-card-name">{template.name}</p>
                <RoomPreview id={template.templateId} isTemplate={true} />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
