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
  createRoomClicked = async () => {
    const roomID = await DataRequests.CREATE_TEST_ROOM();
    this.props.history.push(`/room/${roomID}`);
  };

  render() {
    return (
      <>
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
