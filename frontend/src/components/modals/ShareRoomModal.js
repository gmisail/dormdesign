import React from "react";
import Modal from "react-bootstrap/Modal";

import ClipboardLink from "../ClipboardLink/ClipboardLink";

const ShareRoomModal = (props) => {
  const { id, templateId } = props;
  return (
    <Modal show={props.show} onHide={props.onHide} centered={props.centered}>
      <Modal.Header closeButton>
        <Modal.Title className="custom-modal-title">Share</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <h5>View-only Access</h5>
        <p>
          Anyone with the template link can view/clone the contents of this room, but will not be
          able to modify the room in any way.
        </p>
        <strong>Template Link:</strong>
        <ClipboardLink url={`${window.location.origin}/template/${templateId}`} />

        <hr />
        <h5>Edit Access</h5>
        <p>
          Anyone with the room link has full access to the room.{" "}
          <strong>Be careful who you share this with</strong>
        </p>
        <strong>Room Link:</strong>
        <ClipboardLink url={`${window.location.origin}/room/${id}`} />
      </Modal.Body>
    </Modal>
  );
};

export default ShareRoomModal;
