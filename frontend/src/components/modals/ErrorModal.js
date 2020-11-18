import React from "react";
import Modal from "react-bootstrap/Modal";

const ErrorModal = (props) => {
  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Error</Modal.Title>
      </Modal.Header>
      <Modal.Body>{props.message}</Modal.Body>
    </Modal>
  );
};

export default ErrorModal;
