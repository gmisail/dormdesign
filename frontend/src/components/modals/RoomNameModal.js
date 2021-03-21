import React from "react";
import Modal from "react-bootstrap/Modal";
import ChooseNameForm from "../ChooseNameForm/ChooseNameForm";

const RoomNameModal = (props) => {
  return (
    <Modal show={props.show} onHide={props.onHide} centered={props.centered}>
      <Modal.Header closeButton>
        <Modal.Title className="custom-modal-title">
          {props.title ?? "Room Name"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ChooseNameForm
          name={props.name}
          onSubmit={props.onSubmit}
          saveButtonText={props.saveButtonText}
        />
      </Modal.Body>
    </Modal>
  );
};

export default RoomNameModal;
