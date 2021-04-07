import React, { Component } from "react";

import Modal from "react-bootstrap/Modal";

import DataRequests from "../../controllers/DataRequests";
import RoomGridObject from "../../room-editor/RoomGridObject";
import SceneController from "../../room-editor/SceneController";
import Vector2 from "../../room-editor/Vector2";
import { ReactComponent as Logo } from "../../assets/logo.svg";
import RoomPreviewCard from "../../components/RoomPreviewCard/RoomPreviewCard";
import SingleInputForm from "../../components/SingleInputForm/SingleInputForm";

import "./HomeRoute.scss";
import StorageController from "../../controllers/StorageController";

class HomeRoute extends Component {
  state = {
    joinRoomInput: "",
    showCreateRoomModal: false,
    showJoinRoomModal: false,
    roomHistory: [],
  };

  componentDidMount() {
    document.title = "DormDesign";

    this.setState({ roomHistory: StorageController.getRoomsFromHistory() });

    const backgroundColor = "#f4f4f4";
    const scene = new SceneController(this.backgroundCanvasRef);
    scene.backgroundColor = backgroundColor;
    const grid = new RoomGridObject({
      scene: scene,
      lineColor: "#e0e0e0",
      lineWidth: 2,
      backgroundColor: backgroundColor,
    });
    scene.addChild(grid);

    this.scene = scene;
    this.grid = grid;

    this.fitGridToWindow();
    scene.onResize = this.fitGridToWindow;
  }

  fitGridToWindow = () => {
    this.grid.size = new Vector2(
      this.backgroundCanvasRef.width,
      this.backgroundCanvasRef.height
    );
    this.grid.cellSize = 80 * window.devicePixelRatio;
    this.grid.lineWidth = 2 * window.devicePixelRatio;
  };

  componentWillUnmount() {
    // Cleanup callback
    this.scene.onResize = () => {};
  }

  onSubmitCreateRoomModal = async (name) => {
    const roomID = await DataRequests.CREATE_TEST_ROOM(name);
    this.props.history.push(`/room/${roomID}`);
  };

  onSubmitJoinRoomModal = async (roomID) => {
    this.props.history.push(`/room/${roomID}`);
  };

  renderExistingRooms = () => {
    return this.state.roomHistory.length > 0 ? (
      <div className="recent-rooms-card">
        <h5>Recent Rooms</h5>
        <div className="recent-rooms">
          {this.state.roomHistory.map((room, id) => (
            <RoomPreviewCard
              key={room.id}
              id={room.id}
              roomName={room.name}
            ></RoomPreviewCard>
          ))}
        </div>
      </div>
    ) : null;
  };

  render() {
    return (
      <>
        <canvas
          ref={(ref) => (this.backgroundCanvasRef = ref)}
          id="background-canvas"
        />
        <div className="content-wrapper">
          <div className="content-container">
            <div className="header-container">
              <Logo className="logo" />
            </div>
            <div className="buttons-container">
              <button
                className="custom-btn custom-btn-large mr-sm-4 mr-3"
                name="createRoomButton"
                onClick={() => this.setState({ showCreateRoomModal: true })}
              >
                Create Room
              </button>
              <button
                className="custom-btn custom-btn-large flex-shrink-0 ml-sm-4 ml-3"
                name="createRoomButton"
                onClick={() => this.setState({ showJoinRoomModal: true })}
              >
                Join Room
              </button>
            </div>
            <div className="recent-rooms-container">
              {this.renderExistingRooms()}
            </div>
          </div>
        </div>

        <Modal
          show={this.state.showCreateRoomModal}
          onHide={() => {
            this.setState({ showCreateRoomModal: false });
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title className="custom-modal-title">
              Create a Room
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <SingleInputForm
              placeholder={"Room name"}
              onSubmit={this.onSubmitCreateRoomModal}
              submitButtonText={"Create"}
            />
          </Modal.Body>
        </Modal>

        <Modal
          show={this.state.showJoinRoomModal}
          onHide={() => {
            this.setState({ showJoinRoomModal: false });
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title className="custom-modal-title">
              Join a Room
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <SingleInputForm
              placeholder={"Room ID"}
              onSubmit={this.onSubmitJoinRoomModal}
              submitButtonText={"Join"}
            />
          </Modal.Body>
        </Modal>
      </>
    );
  }
}

export default HomeRoute;
