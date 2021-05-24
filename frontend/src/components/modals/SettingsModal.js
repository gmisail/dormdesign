import React, { useState } from "react";
import { Form, FormControl } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import SingleInputForm from "../SingleInputForm/SingleInputForm";

const SettingsModal = (props) => {
  const [cloneIdValue, setCloneIdValue] = useState("");
  const [snapEnabled, setSnapEnabled] = useState(true);

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

  const onPixelSnappedChanged = (evt) => {
    setSnapEnabled(evt.target.checked);
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

     { 
      /*<h5>Editor Settings</h5>
        <b>Pixel Snap</b>
        <p style={{marginBottom: 4 + 'px'}}>
          Limits movements to whole multiples of the pixel snap ratio. This makes it easier to line up objects and improves performance.
        </p>
        <Form.Group controlId="pixelSnapEnabled">
          <Form.Check type="checkbox" checked={ snapEnabled } onChange={onPixelSnappedChanged} label={ snapEnabled ? "Enabled" : "Disabled" } />
        </Form.Group>

        <b>Pixel Snap Ratio</b>
        <p className="mb-3">
          Specifies how precise you want movement to be. A lower ratio will be more precise at the cost of performance,
          while a higher ratio will have better performance at the cost of precision.
        </p>
        <SingleInputForm
          initialValue={props.userName}
          onSubmit={props.onChangeUserName}
        />

     <br /> */ 
     
     }
        
        <h5>Room Settings</h5>
        <b>Room Name</b>
        <p>The room name can also be changed by clicking on it in the editor.</p>
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
      </Modal.Body>
    </Modal>
  );
};

export default SettingsModal;
