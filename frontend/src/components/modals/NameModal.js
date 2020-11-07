import React from "react";
import Modal from "react-bootstrap/Modal";
import ChooseNameForm from "../ChooseNameForm/ChooseNameForm";

const NameModal = (props) => {
  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Choose Your Name</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        Choose a name so that other people in the room know who you are. This
        data will only be stored locally in your browser.
        <hr />
        <ChooseNameForm onSubmit={props.onSubmit} />
      </Modal.Body>
    </Modal>
  );
};

export default NameModal;
