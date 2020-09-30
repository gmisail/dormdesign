import React, { Component } from "react";
import "./RoomCanvas.css";
import ListItemForm from "../ListItemForm/ListItemForm";
import { Container, Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import SceneController from "../../room-editor/SceneController";
import RoomObject from "../../room-editor/RoomObject";
import Vector2 from "../../room-editor/Vector2";

class RoomCanvas extends Component {
  constructor() {
    super();

    this.state = {
      scene: undefined,
      roomObject: undefined,
      showModal: false,
      modalType: "none",
    };
  }

  componentDidMount() {
    const scene = new SceneController([this.canvas1, this.canvas2]);
    // Points defining the edges of the room (in feet)
    const testBoundaryPoints = [
      new Vector2(0, 0),
      new Vector2(8, 0),
      new Vector2(8, 13),
      new Vector2(0, 13),
      new Vector2(0, 0),
    ];
    const room = new RoomObject({
      scene: scene,
      boundaryPoints: testBoundaryPoints,
      canvasLayer: 1,
    });
    scene.addObject(room);

    this.setState({
      scene: scene,
      roomObject: room,
    });
  }

  addItemToScene = (item) => {
    this.state.roomObject.addItemToRoom({
      name: item.name,
      feetWidth: item.dimensions.w,
      feetHeight: item.dimensions.l,
    });
    this.toggleModal();
  };

  toggleModal = (type) => {
    if (type) {
      this.setState({ modalType: type });
    }
    this.setState({ showModal: !this.state.showModal });
  };

  renderModal() {
    switch (this.state.modalType) {
      case "add":
        return (
          <Modal show={this.state.showModal} onHide={this.toggleModal}>
            <Modal.Header closeButton>
              <Modal.Title>Add an Item</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ListItemForm onSubmit={this.addItemToScene} />
            </Modal.Body>
          </Modal>
        );
      default:
        return;
    }
  }

  render() {
    return (
      <div>
        <Container className="room-editor-container p-0">
          <div className="d-flex justify-content-end mb-2">
            <Button
              className="ml-2"
              variant="secondary"
              name="editCanvasItem"
              disabled={true}
              onClick={() => this.toggleModal("edit")}
            >
              Edit
            </Button>
            <Button
              className="ml-2"
              name="addItemToCanvas"
              onClick={() => this.toggleModal("add")}
            >
              Add Object
            </Button>
          </div>
          <div className="room-canvas-container">
            <canvas
              ref={(ref) => (this.canvas1 = ref)}
              className="room-canvas"
              style={{ zIndex: 1 }}
            ></canvas>
            <canvas
              ref={(ref) => (this.canvas2 = ref)}
              className="room-canvas"
              style={{ zIndex: 2 }}
            ></canvas>
          </div>
        </Container>
        {this.renderModal()}
      </div>
    );
  }
}

export default RoomCanvas;
