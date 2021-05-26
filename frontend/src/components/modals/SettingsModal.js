import React, { useState } from "react";
import { Form, FormControl } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import SingleInputForm from "../SingleInputForm/SingleInputForm";

const SettingsModal = (props) => {
  const [cloneIdValue, setCloneIdValue] = useState("");

  const handleInputChange = (evt) => {
    const target = evt.target;
    let value = target.value;
    const name = target.name;

    if (name === "cloneIdValue") {
      setCloneIdValue(value);
    }
  };

  const onCloneFormSubmit = (evt) => {
    evt.preventDefault();
    props.onClone(cloneIdValue);
  };

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
          Choose a name so that other people in the room know who you are. This
          data will only be stored locally in your browser.
        </p>
        <SingleInputForm
          initialValue={props.userName}
          onSubmit={props.onChangeUserName}
        />

        <br />

        <h5>Room Settings</h5>
        <b>Room Name</b>
        <p>
          The room name can also be changed by clicking on it in the editor.
        </p>
        <SingleInputForm
          initialValue={props.roomName}
          onSubmit={props.onChangeRoomName}
        />

        <br />

        <b>Clone Room</b>
        <p>
          Template cloning allows you to copy the layout, furniture, and
          properties from another room into your room. Note that once you clone
          a room, changes only apply to your copy, not the original.
          <strong> This is not reversible.</strong>
        </p>
        <Form onSubmit={onCloneFormSubmit}>
          <div className="d-flex w-100">
            <FormControl
              name="cloneIdValue"
              onChange={handleInputChange}
              placeholder="Room Template ID"
              aria-label="Room Template ID"
              aria-describedby="Room Identifier"
            />

            <button
              className="custom-btn ml-2 flex-shrink-0"
              disabled={cloneIdValue === "" ? true : false}
              type="submit"
            >
              Clone
            </button>
          </div>
        </Form>

        <br />

        <b>Delete Room</b>
        <p>Once a room is deleted, it cannot be recovered.</p>
        <button
          className="custom-btn custom-btn-warning w-100"
          onClick={onDeleteRoom}
        >
          Delete Room
        </button>
      </Modal.Body>
    </Modal>
  );
};

export default SettingsModal;
