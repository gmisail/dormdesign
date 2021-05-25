import React from "react";
import Modal from "react-bootstrap/Modal";
import Room from "../../models/Room";
import SingleInputForm from "../SingleInputForm/SingleInputForm";

const RoomNameModal = (props) => {
  return (
    <Modal show={props.show} onHide={props.onHide} centered={props.centered}>
      <Modal.Header closeButton>
        <Modal.Title className="custom-modal-title">
          {props.title ?? "Room Name"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <SingleInputForm
          initialValue={props.name}
          onSubmit={props.onSubmit}
          submitButtonText={props.submitButtonText}
          trim={true}
          maxLength={Room.MAX_NAME_LENGTH}
        />
      </Modal.Body>
    </Modal>
  );
};

export default RoomNameModal;
