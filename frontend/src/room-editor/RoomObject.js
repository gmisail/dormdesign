import SceneObject from "./SceneObject";
import MouseController from "./MouseController";
import Collisions from "./Collisions";
import RoomRectObject from "./RoomRectObject";
import RoomGrid from "./RoomGrid";
import Vector2 from "./Vector2";

class RoomObject extends SceneObject {
  constructor({ scene, boundaryPoints, opacity }) {
    super({
      scene: scene,
      parent: undefined,
      position: new Vector2(0, 0),
      size: new Vector2(0, 0),
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

    this._fitRoomToCanvas();

    this.mouseController = new MouseController({
      watchedElement: this.scene.canvas,
      onMouseDown: this.onMouseDown.bind(this),
      onMouseMove: this.onMouseMove.bind(this),
      onMouseUp: this.onMouseUp.bind(this),
    });

    this.state = {
      grid: undefined,
      roomObjects: [],
      selectedObject: undefined,
      objectColorCounter: 0,
    };

    const floorGrid = new RoomGrid({
      scene: this.scene,
      parent: this,
      position: new Vector2(0, 0),
      size: new Vector2(this.size.x, this.size.y),
      scale: new Vector2(1, 1),
      opacity: 1.0,
      lineColor: "#888",
      lineWidth: 0.03,
      staticObject: true,
    });

    this.children.push(floorGrid);
    this.state.floorGrid = floorGrid;

    this.objectColors = ["#0043E0", "#C400E0", "#E03016", "#7EE016", "#0BE07B"];

    //this.addItemToRoom({});
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
    const usableCanvasWidth = this.scene.canvas.width - 2 * this.boundaryOffset;
    const usableCanvasHeight =
      this.scene.canvas.height - 2 * this.boundaryOffset;

    let roomAspect = maxWidth / maxHeight;
    let canvasAspect = this.scene.canvas.width / this.scene.canvas.height;

    // Compare canvas aspect ratio to room aspect ratio in to make sure room will fit in canvas
    if (roomAspect > canvasAspect) {
      this.scale = new Vector2(
        usableCanvasWidth / maxWidth,
        usableCanvasWidth / maxWidth
      );
    } else {
      this.scale = new Vector2(
        usableCanvasHeight / maxHeight,
        usableCanvasHeight / maxHeight
      );
    }

    this.size.x = maxWidth;
    this.size.y = maxHeight;
    const globalSize = this.getGlobalSize();
    this.position = new Vector2(
      this.scene.canvas.width / 2 - globalSize.x / 2,
      this.scene.canvas.height / 2 - globalSize.y / 2
    );
  }

  // Rounds num to the nearest multiple of given a number
  _roundToNearestMultipleOf(num, multipleOf) {
    const remainder = num % multipleOf;
    const divided = num / multipleOf;
    const rounded =
      remainder >= multipleOf / 2 ? Math.ceil(divided) : Math.floor(divided);
    console.log(num, remainder, divided, rounded);
    return multipleOf * rounded;
  }

  // Mouse callbacks that are passed to mouse controller
  onMouseDown(position) {
    if (this.state.selectedObject) {
      this.state.selectedObject.selected = false;
      this.state.selectedObject = undefined;
    }
    // Get the object indices that were under the click and sort them in descending order so that the one on top is selected
    const clicked = this._getChildrenIndicesAtPosition(position).sort(
      (a, b) => b - a
    );
    if (clicked.length > 0) {
      for (let i = 0; i < clicked.length; i++) {
        const obj = this.children[clicked[i]];
        if ("selected" in obj) {
          obj.selected = true;
          this.state.selectedObject = obj;
          // Move the selected object to the back of the children array so its drawn last (on top)
          this.children.push(this.children.splice(clicked[i], 1)[0]);
          break;
        }
      }
    }
  }
  onMouseMove(delta) {
    if (this.state.selectedObject && !this.state.selectedObject.staticObject) {
      const selectedObject = this.state.selectedObject;
      const scaledDelta = new Vector2(
        delta.x / selectedObject.transformMatrix.a,
        delta.y / selectedObject.transformMatrix.d
      );
      const unsnappedPos = selectedObject.getUnsnappedPosition();
      selectedObject.setPosition(
        new Vector2(
          unsnappedPos.x + scaledDelta.x,
          unsnappedPos.y + scaledDelta.y
        )
      );
    }
  }
  onMouseUp() {}

  // Finds all (direct) children that the given point lies within
  _getChildrenIndicesAtPosition(position) {
    const objects = this.children;
    let found = [];
    for (let i = 0; i < objects.length; i++) {
      const bbox = objects[i].getGlobalBoundingBox();
      if (Collisions.pointInRect(position, bbox)) {
        found.push(i);
      }
    }
    return found;
  }

  // Configures the context to draw text with these styles
  _setContextTextStyle() {
    // Font size range
    const fontSize = 0.24;

    this.scene.ctx.font = `bold ${fontSize}px sans-serif`;
    this.scene.ctx.textBaseline = "middle";
    this.scene.ctx.textAlign = "center";
    this.scene.ctx.fillStyle = this.textColor;
  }

  // Takes name, dimensions, color and adds a new item to the room object/scene.
  addItemToRoom({ name, feetWidth, feetHeight }) {
    const color = this.objectColors[this.state.objectColorCounter];
    this.state.objectColorCounter++;
    if (this.state.objectColorCounter === this.objectColors.length) {
      this.state.objectColorCounter = 0;
    }
    const obj = new RoomRectObject({
      scene: this.scene,
      position: new Vector2(0, 0),
      parent: this,
      size: new Vector2(feetWidth ?? 1, feetHeight ?? 1),
      color: color,
      opacity: 0.4,
      nameText: name ?? "New Item",
      staticObject: false,
      snapPosition: true,
      snapOffset: 0.2,
    });
    obj.setPosition(
      new Vector2(
        this.size.x / 2 - obj.size.x / 2,
        this.size.y / 2 - obj.size.y / 2
      )
    );

    this.state.roomObjects.push(obj);
    this.children.push(obj);
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
    const globalSize = this.getGlobalSize();

    // Set context transform to this objects transformation matrix
    ctx.setTransform(this.transformMatrix);

    ctx.fillStyle = this.floorColor;
    ctx.globalAlpha = this.opacity;
    ctx.fillRect(0, 0, this.size.x, this.size.y);
    ctx.globalAlpha = 1.0; // Reset opacity

    // Draw caption text
    const captionText = "1 cell = 1 square foot";
    this._setContextTextStyle();
    const textWidth = ctx.measureText(captionText).width;
    if (textWidth < globalSize.x) {
      ctx.fillText(captionText, this.size.x / 2, this.size.y + 0.3);
    }
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].draw();
    }

    // SceneObject draw func draws children
    super.draw();

    ctx.setTransform(this.transformMatrix);

    // Reset transformation matrix so it doesn't interfere with other draws
    ctx.resetTransform();
  }
}

export default RoomObject;
