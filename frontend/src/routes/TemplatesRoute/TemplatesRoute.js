import "./TemplatesRoute.scss";

import React, { useState } from "react";
import { useHistory } from "react-router";
import SingleInputForm from "../../components/SingleInputForm/SingleInputForm";
import RoomPreview from "../../components/RoomPreview/RoomPreview";
import { useEffect } from "react";
import { Spinner } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import RoomModel from "../../models/RoomModel";
import DataRequests from "../../controllers/DataRequests";

export const TemplatesRoute = () => {
  const [templates, setTemplates] = useState(null);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [showCreateFromTemplateModal, setShowCreateFromTemplateModal] = useState(false);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(null);
  const selectedTemplate = selectedTemplateIndex !== null ? templates[selectedTemplateIndex] : null;

  const history = useHistory();

  useEffect(async () => {
    try {
      const templates = await DataRequests.getFeaturedTemplates();
      setTemplates(templates);
      setLoadingTemplates(false);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const onSubmitCreateRoomModal = async (name) => {
    let roomID;
    try {
      const roomData = await DataRequests.createRoom(name, selectedTemplate.templateId);
      roomID = roomData.id;
      history.push(`/room/${roomID}`);
    } catch (err) {
      setShowCreateFromTemplateModal(false);
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <>
      <div className="templates-container">
        <h3>Featured Templates</h3>
        {loadingTemplates ? (
          <div className="templates-spinner">
            <Spinner animation="border" variant="secondary" />
          </div>
        ) : templates === null ? (
          <p>No templates found</p>
        ) : (
          <div className="templates-grid">
            {templates.map((template, index) => (
              <button
                key={index}
                className="templates-card"
                onClick={() => {
                  setSelectedTemplateIndex(index);
                  setShowCreateFromTemplateModal(true);
                }}
              >
                <p className="templates-card-name">{template.name}</p>
                <RoomPreview id={template.templateId} isTemplate={true} />
              </button>
            ))}
          </div>
        )}
      </div>
      <Modal
        show={showCreateFromTemplateModal}
        onHide={() => {
          setShowCreateFromTemplateModal(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title className="custom-modal-title">Create Copy of Template</Modal.Title>
        </Modal.Header>
        <Modal.Body className="create-room-modal-body">
          <div className="important-info">
            <p>
              <b>IMPORTANT:</b> After you create a room, make sure you write down the link to the
              room (or the room ID itself) somewhere where it won't get lost. Without it, there is
              no way to recover your room.
            </p>
            <p>
              <b>Treat the room ID and link like a password</b>. Anyone you share it with will be
              able to edit or delete your room. If you want to share your room without allowing
              edits, use the template ID.
            </p>
          </div>
          <h5>Clone this template</h5>
          <p>Creates a new room that exactly matches the template "{selectedTemplate?.name}"</p>
          <SingleInputForm
            initialValue={`Copy of ${selectedTemplate?.name}`}
            placeholder={"Room name"}
            onSubmit={onSubmitCreateRoomModal}
            submitButtonText={"Clone"}
            trim={true}
            maxLength={RoomModel.MAX_NAME_LENGTH}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};
