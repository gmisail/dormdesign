import React, { Component } from "react";
import { Container, Row } from "react-bootstrap";
import RoomCanvas from "../components/RoomCanvas/RoomCanvas";

class EditorRoute extends Component {
  render() {
    return (
      <Container className="p-0">
        <Row className="justify-content-center">
          <h2>My Room</h2>
        </Row>
        <RoomCanvas />
      </Container>
    );
  }
}

export default EditorRoute;
