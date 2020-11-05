import React, { Component } from "react";
import { Container, Row, Button } from "react-bootstrap";
import DataController from "../../controllers/DataController";

class HomeRoute extends Component {
  createRoomClicked = async () => {
    const roomID = await DataController.CREATE_TEST_ROOM(); // DataController.createRoom()
    this.props.history.push(`/room/${roomID}`);
  };

  render() {
    return (
      <Container className="pt-3">
        <Row>
          <h2>Home</h2>
        </Row>
        <Row>
          <Button
            variant="primary"
            name="createRoomButton"
            onClick={this.createRoomClicked}
          >
            Create New Room
          </Button>
        </Row>
      </Container>
    );
  }
}

export default HomeRoute;
