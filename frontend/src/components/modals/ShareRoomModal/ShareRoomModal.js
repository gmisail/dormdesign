import React from "react";
import Modal from "react-bootstrap/Modal";

import "./ShareRoomModal.scss";

const ShareRoomModal = (props) => {
  const { id, templateId, link } = props;
  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title className="custom-modal-title">Share</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          Share this room with others by either giving them the room ID (which
          can be entered on the home page) or the direct link to the room.
        </p>
        <strong>Room ID:</strong>
        <p className="emphasized-section">{id ?? "Unknown ID"}</p>
        <strong>Direct Link:</strong>
        <p className="emphasized-section">{link ?? "Unknown link"}</p>

        <p className="mt-5">
          The Template ID can be used to clone the contents of this room. Unlike
          the Room ID, the Template ID does <b>not</b> allow other users to edit
          your room.
        </p>
        <strong>Room Template ID:</strong>
        <p className="emphasized-section">{templateId ?? "Unknown ID"}</p>
      </Modal.Body>
    </Modal>
  );
};

export default ShareRoomModal;
