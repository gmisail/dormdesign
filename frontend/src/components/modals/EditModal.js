import React from "react";
import Modal from "react-bootstrap/Modal";
import ListItemForm from "../ListItemForm/ListItemForm";

const EditModal = (props) => {
  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title className="custom-modal-title">Edit Item</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <ListItemForm item={props.editingItem} onSubmit={props.onSubmit} />
      </Modal.Body>
    </Modal>
  );
};

export default EditModal;
