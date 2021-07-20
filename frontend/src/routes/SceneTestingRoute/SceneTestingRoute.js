import React, { Component } from "react";
import SceneController from "../../room-editor/SceneController";
import RectObject from "../../room-editor/RectObject";

import "./SceneTestingRoute.scss";
import Vector2 from "../../room-editor/Vector2";

class HomeRoute extends Component {
  state = {
    joinRoomInput: "",
    showModal: false,
  };

  componentDidMount() {
    document.title = "Scene Test";

    const scene = new SceneController(this.canvasRef);
    scene.backgroundColor = "#f9f9f9";
    this.scene = scene;

    this.setupScene();
  }

  setupScene() {
    const rect1 = new RectObject({
      scene: this.scene,
      color: "red",
      opacity: 0.4,
      origin: new Vector2(0.5, 0.5),
      scale: new Vector2(2, 2),
      size: new Vector2(this.scene.canvas.width / 10, this.scene.canvas.height / 5),
      position: new Vector2(this.scene.canvas.width / 2, this.scene.canvas.height / 2),
      rotation: 30,
      debugDrawBoundingBox: true,
      debugDrawLocalCoordinates: true,
      debugDrawGlobalBoundingBox: true,
      debugDrawLocalBoundingBox: true,
      debugDrawCoordinateConversionTest: true,
    });
    this.scene.addChild(rect1);

    const rect2 = new RectObject({
      scene: this.scene,
      color: "yellow",
      opacity: 0.4,
      origin: new Vector2(0.5, 0.5),
      scale: new Vector2(0.5, 0.5),
      size: new Vector2(this.scene.canvas.width / 20, this.scene.canvas.height / 10),
      position: new Vector2(200, 50),
      rotation: 30,
      debugDrawBoundingBox: true,
      debugDrawLocalCoordinates: true,
      debugDrawGlobalBoundingBox: true,
      debugDrawLocalBoundingBox: true,
      debugDrawCoordinateConversionTest: true,
    });
    rect1.addChild(rect2);
  }

  render() {
    return <canvas ref={(ref) => (this.canvasRef = ref)} id="test-canvas" />;
  }
}

export default HomeRoute;
