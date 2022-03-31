import React from "react";
import Modal from "react-bootstrap/Modal";
import SingleInputForm from "../SingleInputForm/SingleInputForm";
import RoomModel from "../../models/RoomModel";

const NameModal = (props) => {
  return (
    <Modal show={props.show} onHide={props.onHide} centered={props.centered}>
      <Modal.Header closeButton>
        <Modal.Title className="custom-modal-title">Choose Your Name</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="mb-3">
          Choose a name so that other people in the room know who you are. This data will only be
          stored locally in your browser.
        </p>
        <SingleInputForm
          onSubmit={props.onSubmit}
          submitButtonText={props.submitButtonText}
          maxLength={RoomModel.MAX_USERNAME_LENGTH}
        />
      </Modal.Body>
    </Modal>
  );
};

export default NameModal;
