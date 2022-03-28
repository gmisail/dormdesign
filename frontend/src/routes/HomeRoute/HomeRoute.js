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
import RoomModel from "../../models/RoomModel";
import IconButton from "../../components/IconButton/IconButton";
import RoomPreview from "../../components/RoomPreview/RoomPreview";
import { BsX } from "react-icons/bs";

import RoomInfoImg from "../../assets/room-info-location.png";

class HomeRoute extends Component {
  state = {
    joinRoomInput: "",
    showCreateRoomModal: false,
    showJoinRoomModal: false,
    roomHistory: [],
  };

  async componentDidMount() {
    document.title = "DormDesign";

    const roomHistory = StorageController.getRoomsFromHistory();
    this.setState({
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

  componentWillUnmount() {
    // Cleanup callback
    this.scene.onResize = () => {};
  }

  onSubmitCreateRoom = async (name) => {
    let roomID;
    try {
      const roomData = await DataRequests.createRoom(name);
      roomID = roomData.id;
      this.props.history.push(`/room/${roomID}`);
    } catch (err) {
      this.setState({ showCreateRoomModal: false });
      console.error(err);
      alert(err.message);
    }
  };

  onSubmitCloneRoom = async (templateId) => {
    let roomID;
    try {
      const roomData = await DataRequests.createRoom(undefined, templateId);
      roomID = roomData.id;
      this.props.history.push(`/room/${roomID}`);
    } catch (err) {
      this.setState({ showCreateRoomModal: false });
      console.error(err);
      alert(err.message);
    }
  };

  onSubmitJoinRoom = async (roomID) => {
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
      return (
        <div className="recent-room" key={index} title={room.name}>
          <IconButton
            onClick={() => this.removeRecentRoom(room.id, index)}
            className="recent-room-remove-button"
          >
            <BsX />
          </IconButton>
          <a href={`/room/${room.id}`}>
            <p className="recent-room-name">{room.name}</p>
            <RoomPreview id={room.id} />
          </a>
        </div>
      );
    });
  };

  renderRoomInfoLocation = (text) => {
    return (
      <div className="room-info-location">
        <img src={RoomInfoImg} alt="Room info button" title="Room info button" />
        <p>
          {text ??
            "A room's ID and template ID can be found by clicking the icon above on while on the room page"}
        </p>
      </div>
    );
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
            <Modal.Title className="custom-modal-title">New Room</Modal.Title>
          </Modal.Header>
          <Modal.Body className="create-room-modal-body">
            <div className="important-info">
              <p>
                <b>IMPORTANT:</b> After you create a room, make sure you write down the link to the
                room (or the room ID itself) somewhere where it won't get lost. Without it, there is
                no way to recover your room.
              </p>
              <p>
                <b>Treat the room ID and link like a password</b>. Anyone you share it with will be
                able to edit or delete your room. If you want to share your room without allowing
                edits, use the template ID.
              </p>
              {this.renderRoomInfoLocation()}
            </div>

            <h5>Start from scratch</h5>
            <p>Create an empty room:</p>

            <SingleInputForm
              placeholder={"Room name"}
              onSubmit={this.onSubmitCreateRoom}
              submitButtonText={"Create"}
              trim={true}
              maxLength={RoomModel.MAX_NAME_LENGTH}
            />
            <p name="or">
              <b>- OR -</b>
            </p>
            <h5>Clone an existing room</h5>
            <p>
              Choose from one of our <a href="/templates">Featured Templates</a>. Otherwise, clone
              any existing room by entering it's template ID below:
            </p>
            <SingleInputForm
              placeholder={"Template ID"}
              onSubmit={this.onSubmitCloneRoom}
              submitButtonText={"Clone"}
              maxLength={RoomModel.ID_LENGTH}
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
            <p>You can join a room using its link or by entering the room's ID below</p>
            <SingleInputForm
              placeholder={"Room ID"}
              onSubmit={this.onSubmitJoinRoom}
              submitButtonText={"Join"}
              maxLength={RoomModel.ID_LENGTH}
            />
            {this.renderRoomInfoLocation(
              "A room's ID can be found by clicking the above icon while on the room page"
            )}
          </Modal.Body>
        </Modal>
      </>
    );
  }
}

export default HomeRoute;
