import React from "react";
import Modal from "react-bootstrap/Modal";

const ErrorModal = (props) => {
  return (
    <Modal show={props.show} onHide={props.onHide} centered={props.centered}>
      <Modal.Header closeButton>
        <Modal.Title className="custom-modal-title">
          Something went wrong...
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>{props.message}</Modal.Body>
    </Modal>
  );
};

export default ErrorModal;
