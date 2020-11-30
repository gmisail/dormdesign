import React from "react";
import { Button, Form, InputGroup, FormControl } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import ChooseNameForm from "../ChooseNameForm/ChooseNameForm";
import VertexForm from "../VertexForm";

class SettingsModal extends React.Component {
  constructor() {
    super();

    this.state = {
      id: "",
    };

    this.onClone = this.onClone.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange = (evt) => {
    this.setState({ id: evt.target.value });
  };

  onClone = (evt) => {
    this.props.onClone(this.state.id);
  };

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Settings</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <h5>Layout</h5>
            <VertexForm
              bounds={this.props.bounds}
              onUpdateLayout={this.props.onUpdateLayout}
            ></VertexForm>
            <hr />
            <h5>Clone Existing Room</h5>
            <p>
              Cloning allows you to copy the layout, furniture, and properties
              from another room into your room. Note that once you clone a room,
              changes only apply to your copy, not the original.
            </p>

            <InputGroup className="mb-3">
              <FormControl
                onChange={this.onChange}
                placeholder="Room ID"
                aria-label="Room ID"
                aria-describedby="Room Identifier"
              />

              <InputGroup.Append>
                <Button onClick={this.onClone}>Clone</Button>
              </InputGroup.Append>
            </InputGroup>
          </Form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default SettingsModal;
