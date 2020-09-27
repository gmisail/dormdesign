import React, { Component } from "react";
import { Container } from "react-bootstrap";
import './RoomCanvas.css';
import SceneController from '../../room-editor/SceneController';
import RoomObject from "../../room-editor/RoomObject";
import Vector2 from "../../room-editor/Vector2";

class RoomCanvas extends Component {
  componentDidMount() {
    const scene = new SceneController(this.canvas);
    // Points defining the edges of the room (in feet)
    const testBoundaryPoints = [
      new Vector2(0, 0),
      new Vector2(8, 0),
      new Vector2(8, 13),
      new Vector2(0, 13),
      new Vector2(0, 0),
    ];
    const room = new RoomObject({ scene: scene, boundaryPoints: testBoundaryPoints });
    scene.addObject(room);
  }

  render() {
    return (
      <Container className="room-canvas-container">
        <canvas ref={ ref => (this.canvas = ref)} className="room-canvas"></canvas>
      </Container>
      
    )
  }
}

export default RoomCanvas;