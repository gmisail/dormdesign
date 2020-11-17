import React from "react";
import Modal from "react-bootstrap/Modal";
import ChooseNameForm from "../ChooseNameForm/ChooseNameForm";

const SettingsModal = (props) => {
  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>

      <Modal.Body></Modal.Body>
    </Modal>
  );
};

export default SettingsModal;
