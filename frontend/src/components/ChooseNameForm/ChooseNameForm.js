import React, { Component } from "react";
import { Button } from "react-bootstrap";
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
    var value = target.value;

    this.setState({
      name: value,
    });
  };

  onFormSubmit = (event) => {
    event.preventDefault();
    this.setState({ validated: true });

    this.props.onSubmit(this.state.name.trim());
  };

  render() {
    return (
      <Form
        noValidate
        validated={this.state.validated}
        onSubmit={this.onFormSubmit}
      >
        <Form.Group controlId="formItemName">
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
          <Button variant="primary" type="submit">
            Save
          </Button>
        </div>
      </Form>
    );
  }
}

export default ChooseNameForm;
