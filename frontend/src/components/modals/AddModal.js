import React from "react";
import Modal from "react-bootstrap/Modal";
import ListItemForm from "../ListItemForm/ListItemForm";

const AddModal = (props) => {
  return (
    <Modal show={props.show} onHide={props.onHide} centered={props.centered}>
      <Modal.Header closeButton>
        <Modal.Title className="custom-modal-title">New Item</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <ListItemForm onSubmit={props.onSubmit} />
      </Modal.Body>
    </Modal>
  );
};

export default AddModal;
