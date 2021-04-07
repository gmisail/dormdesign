import React, { useState } from "react";
import { Form } from "react-bootstrap";

/*
  Creates a single-line form with an input and submit buttom
*/
const SingleInputForm = (props) => {
  const { initialValue, submitButtonText, placeholder } = props;
  const trim = props.trim ?? false; // Whether or not to trim input text
  const allowEmptySubmit = props.allowEmptySubmit ?? false; // Whether or not to enable submitting an empty input

  const [inputValue, setInputValue] = useState(initialValue ?? "");

  const handleInputChange = (event) => {
    const target = event.target;
    const value = target.value;

    setInputValue(value);
  };

  const onFormSubmit = (event) => {
    event.preventDefault();

    const value = trim ? inputValue.trim() : inputValue;
    if (!allowEmptySubmit && value.length === 0) {
      return;
    }

    props.onSubmit(value);
  };

  return (
    <Form onSubmit={onFormSubmit}>
      <div className="d-flex w-100">
        <Form.Control
          name="inputValue"
          value={inputValue}
          placeholder={placeholder ?? "Name"}
          onChange={handleInputChange}
        />
        <button
          className="custom-btn ml-2 flex-shrink-0"
          disabled={!allowEmptySubmit && inputValue === "" ? true : false}
          type="submit"
        >
          {submitButtonText ?? "Save"}
        </button>
      </div>
    </Form>
  );
};

export default SingleInputForm;
