import React from "react";
import Modal from "react-bootstrap/Modal";

import ClipboardLink from "../ClipboardLink/ClipboardLink";

const ShareTemplateModal = (props) => {
  const { id } = props;
  return (
    <Modal show={props.show} onHide={props.onHide} centered={props.centered}>
      <Modal.Header closeButton>
        <Modal.Title className="custom-modal-title">Share</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>Share this template with others.</p>
        <strong>Template Link:</strong>
        <ClipboardLink url={`${window.location.origin}/template/${id}`} />
      </Modal.Body>
    </Modal>
  );
};

export default ShareTemplateModal;
