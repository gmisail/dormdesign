import React, { Component } from "react";
import Form from "react-bootstrap/Form";

class ChooseNameForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      validated: false,
    };
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.value;

    this.setState({
      name: value,
    });
  };

  onFormSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    this.setState({ validated: true });
    if (form.checkValidity() === false) {
      event.stopPropagation();
      return;
    }

    this.props.onSubmit(this.state.name.trim());
  };

  render() {
    return (
      <Form
        noValidate
        validated={this.state.validated}
        onSubmit={this.onFormSubmit}
      >
        <Form.Group controlId="formUserName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            name="nameValue"
            value={this.state.nameInputValue}
            placeholder="Johnny Appleseed"
            onChange={this.handleInputChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Please choose a name.
          </Form.Control.Feedback>
        </Form.Group>

        <div className="text-right">
          <button className="custom-btn" type="submit">
            Save
          </button>
        </div>
      </Form>
    );
  }
}

export default ChooseNameForm;
