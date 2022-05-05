import React, { useState } from "react";

import ConfirmationButton from "../ConfirmationButton/ConfirmationButton";
import Modal from "react-bootstrap/Modal";
import RoomNameForm from "../RoomNameForm/RoomNameForm";
import SingleInputForm from "../SingleInputForm/SingleInputForm";
import RoomModel from "../../models/RoomModel";

const SettingsModal = (props) => {
  return (
    <Modal show={props.show} onHide={props.onHide} centered={props.centered}>
      <Modal.Header closeButton>
        <Modal.Title className="custom-modal-title">Settings</Modal.Title>
      </Modal.Header>

      <Modal.Body className="custom-modal-card">
        <h5>User Settings</h5>
        <b>My Name</b>
        <p className="mb-3">
          Choose a name so that other people in the room know who you are. This data is only stored
          locally in your browser.
        </p>
        <SingleInputForm
          initialValue={props.userName}
          onSubmit={props.onChangeUserName}
          submitButtonText="Save"
          submitButtonTextSuccessful="Saved!"
          trim={true}
          allowEmptySubmit={false}
          maxLength={RoomModel.MAX_USERNAME_LENGTH}
        />

        <br />

        <h5>Room Settings</h5>
        <b>Room Name</b>
        <p>The room name can also be changed by clicking on it in the editor.</p>
        <RoomNameForm roomName={props.roomName} onChangeRoomName={props.onChangeRoomName} />

        <br />

        <b>Clone Template</b>
        <p>
          Replace the contents of this room with the contents from a room template.{" "}
          <strong>This is not reversible.</strong> All existing room data will be overwritten and
          lost.
        </p>
        <SingleInputForm
          initialValue=""
          onSubmit={props.onClone}
          submitButtonText="Clone"
          placeholder="Template URL"
        />

        <br />

        <div className="d-flex flex-row justify-content-between align-items-center">
          <div className="mr-2">
            <b>Delete Room</b>
            <p>Once a room is deleted, it cannot be recovered.</p>
          </div>
          <ConfirmationButton label="Delete" onConfirm={props.onDeleteRoom} />
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SettingsModal;
