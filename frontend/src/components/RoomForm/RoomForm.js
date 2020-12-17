import React, { useState } from "react";
import Form from "react-bootstrap/Form";

const RoomForm = (props) => {
  const [nameValue, setNameValue] = useState(props.name ?? "");
  const [validated, setValidated] = useState(false);

  const handleInputChange = (event) => {
    if (event.target.value.length > 40) return;

    // If other inputs are added to form, will need to determine which state variable to set depending on which input is changed
    setNameValue(event.target.value);
  };

  const onFormSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    setValidated(true);
    if (form.checkValidity() === false) {
      event.stopPropagation();
      return;
    }

    const roomName = nameValue.trim();

    if (roomName.length === 0) {
      setValidated(false);
      event.stopPropagation();
      return;
    }

    props.onSubmit(roomName);
  };

  return (
    <Form noValidate validated={validated} onSubmit={onFormSubmit}>
      <Form.Group controlId="formRoomName">
        <Form.Label>Name</Form.Label>
        <Form.Control
          name="nameValue"
          value={nameValue}
          placeholder="Room name"
          onChange={handleInputChange}
          required
        />
        <Form.Control.Feedback type="invalid">
          Please choose a room name.
        </Form.Control.Feedback>
      </Form.Group>

      <div className="text-right">
        <button className="custom-btn" type="submit">
          Save
        </button>
      </div>
    </Form>
  );
};

export default RoomForm;
