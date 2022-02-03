import "./HomeRoute.scss";

import React, { Component } from "react";

import DataRequests from "../../controllers/DataRequests";
import { ReactComponent as Logo } from "../../assets/logo.svg";
import Modal from "react-bootstrap/Modal";
import RoomGridObject from "../../room-editor/RoomGridObject";
import SceneController from "../../room-editor/SceneController";
import SingleInputForm from "../../components/SingleInputForm/SingleInputForm";
import StorageController from "../../controllers/StorageController";
import Vector2 from "../../room-editor/Vector2";
import Room from "../../models/Room";
import IconButton from "../../components/IconButton/IconButton";
import RoomPreview from "../../components/RoomPreview/RoomPreview";
import { BsX } from "react-icons/bs";

class HomeRoute extends Component {
  state = {
    joinRoomInput: "",
    showCreateRoomModal: false,
    showJoinRoomModal: false,
    roomHistory: [],
    roomPreviews: [],
  };

  async componentDidMount() {
    document.title = "DormDesign";

    const roomHistory = StorageController.getRoomsFromHistory();
    const roomPreviews = await this.generatePreviews(roomHistory);
    this.setState({
      roomPreviews,
      roomHistory: roomHistory,
    });

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
    this.grid.size = new Vector2(this.backgroundCanvasRef.width, this.backgroundCanvasRef.height);
    this.grid.cellSize = 80 * window.devicePixelRatio;
    this.grid.lineWidth = 2 * window.devicePixelRatio;
  };

  generatePreviews = async (roomHistory) => {
    if (roomHistory.length === 0) {
      return;
    }
    const previews = roomHistory.map((room) => room.id);
    const previewsData = await DataRequests.generatePreview(previews);

    return previewsData;
  };

  componentWillUnmount() {
    // Cleanup callback
    this.scene.onResize = () => {};
  }

  onSubmitCreateRoomModal = async (name) => {
    const roomData = await DataRequests.createRoom(name);
    const roomID = roomData.id;

    this.props.history.push(`/room/${roomID}`);
  };

  onSubmitJoinRoomModal = async (roomID) => {
    this.props.history.push(`/room/${roomID}`);
  };

  // Removes a recent room from local storage and from local state.
  // Takes in id of room and curent index of it in 'roomHistory' state variable
  removeRecentRoom = (id, index) => {
    StorageController.removeRoomFromHistory(id);
    this.setState({
      roomHistory: this.state.roomHistory.filter((_, i) => i != index),
    });
  };

  renderRecentRooms = () => {
    return this.state.roomHistory.map((room, index) => {
      // Preview might not be loaded yet, if not just pass an empty URI ("")
      const preview = this.state.roomPreviews[index];

      if (preview == null) {
        console.error(`Room (${room.id}) could not render a preview.`);
      }

      return (
        <div className="recent-room" key={index}>
          <IconButton
            onClick={() => this.removeRecentRoom(room.id, index)}
            className="recent-room-remove-button"
          >
            <BsX />
          </IconButton>
          <a href={`/room/${room.id}`} className="">
            <span className="recent-room-name">{room.name}</span>
            <RoomPreview
              className="recent-room-image"
              preview={preview == undefined ? "" : preview}
            />
          </a>
        </div>
      );
    });
  };

  render() {
    return (
      <>
        <canvas ref={(ref) => (this.backgroundCanvasRef = ref)} id="background-canvas" />
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
              {this.state.roomHistory.length > 0 ? (
                <>
                  <h5>Recent Rooms</h5>
                  <div className="recent-rooms">{this.renderRecentRooms()}</div>
                </>
              ) : null}
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
            <Modal.Title className="custom-modal-title">Create a Room</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <SingleInputForm
              placeholder={"Room name"}
              onSubmit={this.onSubmitCreateRoomModal}
              submitButtonText={"Create"}
              trim={true}
              maxLength={Room.MAX_NAME_LENGTH}
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
            <Modal.Title className="custom-modal-title">Join a Room</Modal.Title>
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
