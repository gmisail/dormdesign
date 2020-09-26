import SceneObject from "./SceneObject";
import RoomRectObject from "./RoomRectObject";
import RoomGrid from "./RoomGrid";
import Vector2 from "./Vector2";

class RoomObject extends SceneObject {
  constructor({ scene, boundaryPoints, opacity }) {
    super({
      scene: scene,
      parent: undefined,
      position: new Vector2(0, 0),
      size: { x: 0, y: 0 },
      scale: new Vector2(1, 1),
      staticObject: true,
    });

    // Points that define room boundary (measured in feet)
    this.boundaryPoints = boundaryPoints;

    this.floorColor = "#ddd";
    this.textColor = "#222";
    this.borderColor = "#555";
    this.borderWidth = 0.08;
    this.opacity = opacity ?? 1.0;

    this.roomObjects = [];

    this._fitRoomToCanvas();

    const grid = new RoomGrid({
      scene: this.scene,
      parent: this,
      position: new Vector2(0, 0),
      size: new Vector2(this.size.x, this.size.y),
      scale: new Vector2(1, 1),
      opacity: 1.0,
      lineColor: "#888",
      lineWidth: 0.03,
      staticObject: true,
    })

    this.children.push(grid);

    const cube = new RoomRectObject ({
      scene: this.scene,
      position: new Vector2(0, 0),
      parent: this,
      size: new Vector2(3, 6),
      color: "#ff0000",
      opacity: 0.5,
      nameText: "Object Name",
      staticObject: false,
    });
    // console.log(this.size);
    cube.position = new Vector2(this.size.x/2 - cube.size.x/2, this.size.y/2 - cube.size.y/2);
    // console.log(this.getWidth(), this.getHeight());
    // console.log(cube.getWidth(), cube.getHeight());
    // console.log(cube.position);
    //cube.selected = true;
    this.roomObjects.push(cube);
    this.children.push(cube);
  }

  _fitRoomToCanvas() {
    // Padding from edge of canvas for room outline
    this.boundaryOffset = this.scene.canvas.width * 0.05;
    
    // Find canvas pixels per foot
    let maxWidth;
    let maxHeight;
    for (let i = 0; i < this.boundaryPoints.length; i++) {
      if (!maxWidth || this.boundaryPoints[i].x > maxWidth) {
        maxWidth = this.boundaryPoints[i].x;
      }
      if (!maxHeight || this.boundaryPoints[i].y > maxHeight) {
        maxHeight = this.boundaryPoints[i].y;
      }
    }
    const usableCanvasWidth =
      this.scene.canvas.width - 2 * this.boundaryOffset;
    const usableCanvasHeight =
      this.scene.canvas.height - 2 * this.boundaryOffset;

    let roomAspect = maxWidth / maxHeight;
    let canvasAspect =
      this.scene.canvas.width / this.scene.canvas.height;

    // Compare canvas aspect ratio to room aspect ratio in to make sure room will fit in canvas
    if (roomAspect > canvasAspect) {
      this.scale = new Vector2(usableCanvasWidth / maxWidth, usableCanvasWidth / maxWidth);
    } else {
      this.scale = new Vector2(usableCanvasHeight / maxHeight, usableCanvasHeight / maxHeight);
    }

    this.size.x = maxWidth;
    this.size.y = maxHeight;
    this.position = new Vector2(
      this.scene.canvas.width / 2 - this.getWidth() / 2,
      this.scene.canvas.height / 2 - this.getHeight() / 2
    );
  }

  _setContextTextStyle() {
    // Font size range 
    const fontSize = 0.14 * window.devicePixelRatio;//Math.min(13 * window.devicePixelRatio, Math.max(this.pixelsPerFoot * 0.25, 7 * window.devicePixelRatio));
    
    this.scene.ctx.font = `bold ${fontSize}px sans-serif`;
    this.scene.ctx.textBaseline = "middle";
    this.scene.ctx.textAlign = "center";
    this.scene.ctx.fillStyle = this.textColor;
  }

  update() {
    // Resize if the canvas has been resized
    if (this.scene.resized) {
      this._fitRoomToCanvas();
    }
    super.update();
  }

  draw() {
    const ctx = this.scene.ctx;
    //const bbox = this.getBoundingBox();

    ctx.setTransform(this.getTransform());
    // console.log(ctx.getTransform());
    //console.log("POS", this.position.x, this.position.y, "SIZE", this.size.x, this.size.y, "SCALE", this.scale.x, this.scale.y);
    ctx.fillStyle = this.floorColor;
    ctx.globalAlpha = this.opacity;
    ctx.fillRect(0, 0, this.size.x, this.size.y);
    ctx.globalAlpha = 1.0; // Reset opacity

    // Draw caption text
    const captionText = "1 cell = 1 square foot";
    this._setContextTextStyle();
    const textWidth = ctx.measureText(captionText).width;
    if (textWidth < this.getWidth()) {
      ctx.fillText(
        captionText,
        this.size.x / 2,
        this.size.y + 0.3,
      );
    }
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].draw();
    }

    super.draw();

    ctx.setTransform(this.getTransform());

    // Draw border
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = this.borderWidth;
    ctx.lineJoin = "round";
    ctx.beginPath();

    ctx.moveTo(0, 0);
    ctx.lineTo(this.size.x, 0);
    ctx.lineTo(this.size.x, this.size.y);
    ctx.lineTo(0, this.size.y);
    ctx.lineTo(0, 0);
    ctx.stroke();

    ctx.resetTransform();
  }
}

export default RoomObject;

