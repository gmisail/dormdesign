import React from "react";
import Modal from "react-bootstrap/Modal";
import RoomForm from "../RoomForm/RoomForm";

const RoomNameModal = (props) => {
  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title className="custom-modal-title">
          Change Room Name
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <RoomForm onSubmit={props.onSubmit}></RoomForm>
      </Modal.Body>
    </Modal>
  );
};

export default RoomNameModal;
