import React, { useState } from "react";
import { Form } from "react-bootstrap";

const ChooseNameForm = (props) => {
  const [nameValue, setNameValue] = useState(props.name ?? "");

  const handleInputChange = (event) => {
    const target = event.target;
    const value = target.value;

    setNameValue(value);
  };

  const onFormSubmit = (event) => {
    event.preventDefault();

    const trimmedName = nameValue.trim();
    if (trimmedName.length === 0) {
      return;
    }

    props.onSubmit(trimmedName);
  };

  return (
    <Form onSubmit={onFormSubmit}>
      <div className="d-flex w-100">
        <Form.Control
          name="nameValue"
          value={nameValue}
          placeholder={props.placeholder ?? "Name"}
          onChange={handleInputChange}
        />
        <button
          className="custom-btn ml-2 flex-shrink-0"
          disabled={nameValue === "" ? true : false}
          type="submit"
        >
          Save
        </button>
      </div>
    </Form>
  );
};

export default ChooseNameForm;
