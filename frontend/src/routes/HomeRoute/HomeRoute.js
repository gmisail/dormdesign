import React, { Component } from "react";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Jumbotron,
  InputGroup,
  FormControl,
} from "react-bootstrap";

import DataRequests from "../../controllers/DataRequests";
import DormDesignLogo from "../../assets/logo.svg";
import RoomEditorObject from "../../room-editor/RoomEditorObject";
import SceneController from "../../room-editor/SceneController";
import Vector2 from "../../room-editor/Vector2";
import "./HomeRoute.scss";

class HomeRoute extends Component {
  componentDidMount() {
    const scene = new SceneController(this.backgroundCanvasRef);
    scene.backgroundColor = "#f9f9f9";
    // Points defining the edges of the room (in feet)
    const boundaryPoints = [
      new Vector2(2, 1),
      new Vector2(13, 1),
      new Vector2(13, 3),
      new Vector2(15, 3),
      new Vector2(15, 9),
      new Vector2(0, 9),
      new Vector2(0, 3),
      new Vector2(2, 3),
    ];
    const room = new RoomEditorObject({
      scene: scene,
      boundaryPoints: [],
      boundaryWidth: 0,
      backgroundColor: "#f9f9f9", //"#f9f9f9",
      gridLineColor: "#ccc",
      onObjectsUpdated: this.itemsUpdatedInEditor,
      onObjectSelected: this.itemSelectedInEditor,
      selectedObjectID: undefined,
      fontFamily: "Source Sans Pro",
      autoFitToCanvas: false,
    });
    scene.addChild(room);

    this.scene = scene;
    this.roomObject = room;

    this.fitRoomToWindow();
    scene.onResize = this.fitRoomToWindow;

    room.addItemToRoom({
      id: "item1",
      width: 8.75,
      height: 1.7,
      position: new Vector2(room.size.x / 2, 250),
      visible: true,
      scale: new Vector2(100, 100),
      color: "#ffffff00",
    });
    const item1 = room.roomItems.get("item1");
    item1.selected = true;
  }

  componentWillUnmount() {
    this.scene.onResize = () => {};
  }

  fitRoomToWindow = () => {
    this.roomObject.size = new Vector2(
      this.backgroundCanvasRef.width,
      this.backgroundCanvasRef.height
    );

    this.roomObject.floorGrid.cellSize = 80 * window.devicePixelRatio;
    this.roomObject.floorGrid.lineWidth = 2 * window.devicePixelRatio;

    this.roomObject.setBoundaries([
      new Vector2(0, 0),
      new Vector2(this.roomObject.size.x, 0),
      new Vector2(this.roomObject.size.x, this.roomObject.size.y),
      new Vector2(0, this.roomObject.size.y),
    ]);
  };

  createRoomClicked = async () => {
    const roomID = await DataRequests.CREATE_TEST_ROOM();
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
              <div className="logo">
                <img
                  className="logo-svg"
                  src={DormDesignLogo}
                  alt="DormDesign"
                ></img>
              </div>
            </div>
            <div className="create-room-container custom-card">
              <h4>Create a Room</h4>
              <p>Get started with a fresh room.</p>
              <button
                className="custom-btn"
                name="createRoomButton"
                onClick={this.createRoomClicked}
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
                  style={{ minWidth: 0 }}
                />
                <button
                  className="custom-btn flex-shrink-0 ml-2"
                  name="createRoomButton"
                  onClick={this.createRoomClicked}
                >
                  Join Room
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default HomeRoute;
