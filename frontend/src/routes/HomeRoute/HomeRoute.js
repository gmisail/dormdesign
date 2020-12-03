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
    // const testBoundaryPath = [
    //   new Vector2(1, 2),
    //   new Vector2(2, 2),
    //   new Vector2(2, 1),
    //   new Vector2(7.3, 1),
    //   new Vector2(7.3, 2),
    //   new Vector2(8, 2),
    //   new Vector2(8, 5),
    //   new Vector2(9, 5),
    //   new Vector2(9, 6),
    //   new Vector2(8, 6),
    //   new Vector2(8, 13),
    //   new Vector2(4, 13),
    //   new Vector2(4, 6.5),
    //   new Vector2(0, 6.5),
    //   new Vector2(0, 4),
    //   new Vector2(3, 4),
    //   new Vector2(3, 3),
    //   new Vector2(0, 3),
    //   new Vector2(0, -5),
    //   new Vector2(1, -5),
    // ];
    const room = new RoomEditorObject({
      scene: scene,
      // boundaryPoints: testBoundaryPath,
      backgroundColor: "#f9f9f9",
      onObjectsUpdated: this.itemsUpdatedInEditor,
      onObjectSelected: this.itemSelectedInEditor,
      selectedObjectID: undefined,
      fontFamily: "Source Sans Pro",
    });
    scene.addChild(room);

    this.scene = scene;
    this.roomObject = room;
  }

  createRoomClicked = async () => {
    const roomID = await DataRequests.CREATE_TEST_ROOM();
    this.props.history.push(`/room/${roomID}`);
  };

  render() {
    return (
      <>
        {/* <Jumbotron id="landing-jumbotron" fluid>
          <Container>
            <h1>Plan for college, together.</h1>
            <p>An RCOS Project.</p>
          </Container>
        </Jumbotron> */}
        <canvas
          ref={(ref) => (this.backgroundCanvasRef = ref)}
          id="background-canvas"
        />
        <div class="header-container">
          <div class="logo">
            <img
              className="logo-svg"
              src={DormDesignLogo}
              alt="DormDesign"
            ></img>
          </div>
        </div>
        <div className="content-container">
          <div className="create-room-container custom-card">
            <h4>Create a Room</h4>
            <p>Get started with a fresh room.</p>
            <Button
              variant="primary"
              name="createRoomButton"
              onClick={this.createRoomClicked}
            >
              Create New Room
            </Button>
          </div>
          <div className="join-room-container custom-card">
            <h4>Join a Room</h4>
            <p>Enter the ID for an existing room.</p>
            <InputGroup>
              <FormControl placeholder="Room ID" aria-label="Room Code" />
              <InputGroup.Append>
                <Button
                  variant="primary"
                  name="createRoomButton"
                  onClick={this.createRoomClicked}
                >
                  Join Room
                </Button>
              </InputGroup.Append>
            </InputGroup>
          </div>
        </div>

        {/* <Col>
              <Card>
                <Card.Body>
                  <Card.Title>
                    <h4>Join a Room</h4>
                  </Card.Title>
                  <p>Need to join an existing room?</p>

                  <InputGroup>
                    <FormControl
                      placeholder="Room Code"
                      aria-label="Room Code"
                    />
                    <InputGroup.Append>
                      <Button
                        variant="primary"
                        name="createRoomButton"
                        onClick={this.createRoomClicked}
                      >
                        Join Room
                      </Button>
                    </InputGroup.Append>
                  </InputGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container> */}
      </>
    );
  }
}

export default HomeRoute;
