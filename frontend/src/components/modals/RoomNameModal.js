import React from "react";
import Modal from "react-bootstrap/Modal";
import RoomForm from "../RoomForm/RoomForm";

const RoomNameModal = (props) => {
  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title className="custom-modal-title">
          {props.title ?? "Room Name"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <RoomForm name={props.name} onSubmit={props.onSubmit} />
      </Modal.Body>
    </Modal>
  );
};

export default RoomNameModal;
