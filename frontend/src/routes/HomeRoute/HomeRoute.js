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
import DataController from "../../controllers/DataController";

class HomeRoute extends Component {
  createRoomClicked = async () => {
    const roomID = await DataController.CREATE_TEST_ROOM(); // DataController.createRoom()
    this.props.history.push(`/room/${roomID}`);
  };

  render() {
    return (
      <>
        <Jumbotron id="landing-jumbotron" fluid>
          <Container>
            <h1>Plan for college, together.</h1>
            <p>An RCOS Project.</p>
          </Container>
        </Jumbotron>

        <Container className="pt-3">
          <Row>
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>
                    <h4>Create a Room</h4>
                  </Card.Title>
                  <p>Lorem ipsum.</p>
                  <Button
                    variant="primary"
                    name="createRoomButton"
                    onClick={this.createRoomClicked}
                  >
                    Create New Room
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col>
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
        </Container>
      </>
    );
  }
}

export default HomeRoute;
