import React, { Component } from "react";
import { Container } from "react-bootstrap";
import './RoomCanvas.css';
import SceneController from '../../room-editor/SceneController';

class RoomCanvas extends Component {
  componentDidMount() {
    const scene = new SceneController(this.canvas); 
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