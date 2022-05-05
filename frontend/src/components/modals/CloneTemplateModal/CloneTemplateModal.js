import "./CloneTemplateModal.scss";

import React from "react";
import Modal from "react-bootstrap/Modal";
import SingleInputForm from "../../../components/SingleInputForm/SingleInputForm";
import RoomModel from "../../../models/RoomModel";

const CloneTemplateModal = (props) => {
  return (
    <Modal show={props.show} onHide={props.onHide} centered={props.centered}>
      <Modal.Header closeButton>
        <Modal.Title className="custom-modal-title">Clone Template</Modal.Title>
      </Modal.Header>
      <Modal.Body className="clone-template-modal-body">
        <h6>New Name</h6>
        <SingleInputForm
          initialValue={`Copy of ${props.templateName}`}
          placeholder={"Room name"}
          onSubmit={props.onSubmit}
          submitButtonText={"Clone"}
          trim={true}
          maxLength={RoomModel.MAX_NAME_LENGTH}
        />
        <div className="important-info">
          <p>
            <b>IMPORTANT:</b> After you create a room, make sure you write down the link to the room
            (or the room ID itself) somewhere where it won't get lost. Without it, there is no way
            to recover your room.
          </p>
          <p>
            <b>Treat the room link/ID like a password</b>. Anyone who has either will be able to
            edit or delete your room. If you want to share your room without allowing edits, share a
            the template link or ID.
          </p>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default CloneTemplateModal;
