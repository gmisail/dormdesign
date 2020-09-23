import React, { Component } from "react";
import './RoomCanvas.css';
import SceneController from '../../room-editor/SceneController';

class RoomCanvas extends Component {
  componentDidMount() {
    const scene = new SceneController(this.canvas); 
  }

  render() {
    return (
      <canvas ref={ ref => (this.canvas = ref)} className="room-canvas"></canvas>
    )
  }
}

export default RoomCanvas;