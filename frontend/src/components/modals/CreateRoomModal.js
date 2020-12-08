import React from "react";
import Modal from "react-bootstrap/Modal";
import RoomForm from "../RoomForm/RoomForm";

const CreateRoomModal = (props) => {
  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title className="custom-modal-title">Create Room</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <RoomForm onSubmit={props.onSubmit} />
      </Modal.Body>
    </Modal>
  );
};

export default CreateRoomModal;
