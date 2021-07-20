import React, { useState } from "react";

import ConfirmationButton from "../ConfirmationButton/ConfirmationButton";
import Modal from "react-bootstrap/Modal";
import RoomNameForm from "../RoomNameForm/RoomNameForm";
import SingleInputForm from "../SingleInputForm/SingleInputForm";

const SettingsModal = (props) => {
  const onDeleteRoom = (evt) => {
    props.onDeleteRoom();
  };

  return (
    <Modal show={props.show} onHide={props.onHide} centered={props.centered}>
      <Modal.Header closeButton>
        <Modal.Title className="custom-modal-title">Settings</Modal.Title>
      </Modal.Header>

      <Modal.Body className="custom-modal-card">
        <h5>User Settings</h5>
        <b>My Name</b>
        <p className="mb-3">
          Choose a name so that other people in the room know who you are. This data will only be
          stored locally in your browser.
        </p>
        <SingleInputForm
          initialValue={props.userName}
          onSubmit={props.onChangeUserName}
          trim={true}
          allowEmptySubmit={false}
        />

        <br />

        <h5>Room Settings</h5>
        <b>Room Name</b>
        <p>The room name can also be changed by clicking on it in the editor.</p>
        <RoomNameForm roomName={props.roomName} onChangeRoomName={props.onChangeRoomName} />

        <br />

        <b>Clone Room</b>
        <p>
          Template cloning allows you to copy the layout, furniture, and properties from another
          room into your room. Note that once you clone a room, changes only apply to your copy, not
          the original.
          <strong> This is not reversible.</strong>
        </p>
        <SingleInputForm
          initialValue=""
          onSubmit={props.onClone}
          submitButtonText="Clone"
          placeholder="Room Template ID"
        />

        <br />

        <div className="d-flex flex-row justify-content-between align-items-center">
          <div className="mr-2">
            <b>Delete Room</b>
            <p>Once a room is deleted, it cannot be recovered.</p>
          </div>
          <ConfirmationButton label="Delete" onConfirm={onDeleteRoom} />
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SettingsModal;
