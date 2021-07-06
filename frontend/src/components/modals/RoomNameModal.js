import Modal from "react-bootstrap/Modal";
import React from "react";
import Room from "../../models/Room";
import RoomNameForm from "../RoomNameForm/RoomNameForm";
import SingleInputForm from "../SingleInputForm/SingleInputForm";

const RoomNameModal = (props) => {
  return (
    <Modal show={props.show} onHide={props.onHide} centered={props.centered}>
      <Modal.Header closeButton>
        <Modal.Title className="custom-modal-title">
          {props.title ?? "Room Name"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <RoomNameForm roomName={props.name} onChangeRoomName={props.onSubmit} />
      </Modal.Body>
    </Modal>
  );
};

export default RoomNameModal;
