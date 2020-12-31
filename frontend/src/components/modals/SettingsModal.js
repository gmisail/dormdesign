import React from "react";
import { Form, FormControl, Col } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { RoomContext } from "../../routes/RoomRoute/RoomContext";
import VertexForm from "../VertexForm/VertexForm";

class SettingsModal extends React.Component {
  static contextType = RoomContext;

  state = {
    id: "",
  };

  onChange = (evt) => {
    this.setState({ id: evt.target.value });
  };

  onCloneFormSubmit = (evt) => {
    evt.preventDefault();
    this.props.onClone(this.state.id);
  };

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title className="custom-modal-title">Settings</Modal.Title>
        </Modal.Header>

        <Modal.Body className="custom-modal-card">
          <h5>Layout</h5>
          <VertexForm
            bounds={this.context.bounds}
            onSubmit={this.context.updateBounds}
          ></VertexForm>
          <hr />
          <h5>Clone from Template</h5>
          <p>
            Template cloning allows you to copy the layout, furniture, and
            properties from another room into your room. Note that once you
            clone a room, changes only apply to your copy, not the original.
            <strong> This is not reversible.</strong>
          </p>
          <Form onSubmit={this.onCloneFormSubmit}>
            <Form.Row className="mb-3">
              <Col>
                <div className="d-flex w-100">
                  <FormControl
                    onChange={this.onChange}
                    placeholder="Room Template ID"
                    aria-label="Room Template ID"
                    aria-describedby="Room Identifier"
                  />

                  <button
                    className="custom-btn ml-2"
                    disabled={this.state.id === "" ? true : false}
                    type="submit"
                  >
                    Clone
                  </button>
                </div>
              </Col>
            </Form.Row>
          </Form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default SettingsModal;
