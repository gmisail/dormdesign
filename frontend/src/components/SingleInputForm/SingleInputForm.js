import React, { useState } from "react";

import { Form } from "react-bootstrap";

/*
  Creates a single-line form with an input and submit buttom
*/
const SingleInputForm = (props) => {
  const {
    initialValue,
    submitButtonText,
    submitButtonTextSuccessful, // Text that is displayed if the the input is valid / has been submitted
    placeholder,
    maxLength,
    buttonClassName,
    mustMatch, // Text that input must match in order for submit button to be enabled
  } = props;

  const trim = props.trim ?? false; // Whether or not to trim input text
  const allowEmptySubmit = props.allowEmptySubmit ?? false; // Whether or not to enable submitting an empty input

  const [inputValue, setInputValue] = useState(initialValue ?? "");
  const [buttonText, setButtonText] = useState(submitButtonText ?? "Save");
  const [buttonTheme, setButtonTheme] = useState(buttonClassName ?? "");

  const handleInputChange = (event) => {
    const target = event.target;
    const value = target.value;

    setButtonText(submitButtonText ?? "Save");
    setButtonTheme(buttonClassName ?? "");

    if (maxLength !== undefined && value.length > maxLength) return;

    setInputValue(value);
  };

  const onFormSubmit = (event) => {
    event.preventDefault();

    const value = trim ? inputValue.trim() : inputValue;
    if (!allowEmptySubmit && value.length === 0) {
      setButtonTheme("custom-btn-danger");
      setButtonText("Error!");

      return;
    }

    setButtonText(submitButtonTextSuccessful ?? "Saved!");

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
          className={`${buttonTheme} custom-btn ml-2 flex-shrink-0`}
          disabled={
            (!allowEmptySubmit && inputValue === "" ? true : false) ||
            (mustMatch !== undefined && inputValue !== mustMatch)
          }
          type="submit"
        >
          {buttonText}
        </button>
      </div>
    </Form>
  );
};

export default SingleInputForm;
