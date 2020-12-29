import React, { Component } from "react";

import { FormControl } from "react-bootstrap";

import DataRequests from "../../controllers/DataRequests";
import RoomGridObject from "../../room-editor/RoomGridObject";
import SceneController from "../../room-editor/SceneController";
import Vector2 from "../../room-editor/Vector2";
import { ReactComponent as Logo } from "../../assets/logo.svg";
import RoomNameModal from "../../components/modals/RoomNameModal";

import "./HomeRoute.scss";

class HomeRoute extends Component {
  state = {
    joinRoomInput: "",
    showModal: false,
  };

  componentDidMount() {
    document.title = "DormDesign";

    const scene = new SceneController(this.backgroundCanvasRef);
    scene.backgroundColor = "#f9f9f9";
    const grid = new RoomGridObject({
      scene: scene,
      lineColor: "#c8c8c8",
      lineWidth: 2,
      backgroundColor: "#f9f9f9",
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

  joinRoomClicked = () => {
    this.props.history.push(`/room/${this.state.joinRoomInput}`);
  };

  onSubmitCreateRoomModal = async (name) => {
    const roomID = await DataRequests.CREATE_TEST_ROOM(name);
    this.props.history.push(`/room/${roomID}`);
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
            <div className="create-room-container custom-card">
              <h4>Create a Room</h4>
              <p>Get started with a fresh room.</p>
              <button
                className="custom-btn"
                name="createRoomButton"
                onClick={() => this.setState({ showModal: true })}
              >
                Create New Room
              </button>
            </div>
            <div className="join-room-container custom-card">
              <h4>Join a Room</h4>
              <p>Enter the ID for an existing room.</p>
              <div className="d-flex w-100">
                <FormControl
                  className="flex-shrink-1"
                  placeholder="Room ID"
                  aria-label="Room Code"
                  onChange={(evt) => {
                    this.setState({ joinRoomInput: evt.target.value });
                  }}
                  style={{ minWidth: 0 }}
                />
                <button
                  className="custom-btn flex-shrink-0 ml-2"
                  name="createRoomButton"
                  onClick={this.joinRoomClicked}
                  disabled={this.state.joinRoomInput === ""}
                >
                  Join Room
                </button>
              </div>
            </div>
          </div>
        </div>
        <RoomNameModal
          title={"Create a Room"}
          show={this.state.showModal}
          onSubmit={this.onSubmitCreateRoomModal}
          onHide={() => {
            this.setState({ showModal: false });
          }}
        />
      </>
    );
  }
}

export default HomeRoute;
