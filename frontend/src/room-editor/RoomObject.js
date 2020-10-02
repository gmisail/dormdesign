import SceneObject from "./SceneObject";
import MouseController from "./MouseController";
import Collisions from "./Collisions";
import RoomRectObject from "./RoomRectObject";
import RoomGridObject from "./RoomGridObject";
import Vector2 from "./Vector2";

class RoomObject extends SceneObject {
  constructor({
    scene,
    boundaryPoints,
    opacity,
    canvasLayer,
    backgroundColor,
  }) {
    super({
      scene: scene,
      parent: undefined,
      position: new Vector2(0, 0),
      size: new Vector2(0, 0),
      scale: new Vector2(1, 1),
      staticObject: true,
      canvasLayer: canvasLayer,
    });

    // Points that define room boundary (measured in feet). Must be in clockwise order
    this.boundaryPoints = boundaryPoints;
    this._offsetPoints = [];

    this.backgroundColor = backgroundColor ?? "#fff";
    this.textColor = "#222";
    this.borderColor = "#555";
    this.borderWidth = 0.07;
    this.opacity = opacity ?? 1.0;

    this._fitRoomToCanvas();
    this._calculateOffsetPoints();

    // Boxes occupying area outside of room. Used for detecting when an object is outside of room bounds
    this.boundaryBoxes = this._getOutOfBoundsBoxes();
    this.drawBoundaryBoxes = false; // When set to true these boxes will be drawn (for debugging)

    this.mouseController = new MouseController({
      watchedElement: this.scene.canvasArray[this.canvasLayer],
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

    const floorGrid = new RoomGridObject({
      scene: this.scene,
      parent: this,
      position: new Vector2(0, 0),
      size: new Vector2(this.size.x, this.size.y),
      scale: new Vector2(1, 1),
      opacity: 0.4,
      lineColor: "#888",
      lineWidth: 0.03,
      staticObject: true,
      canvasLayer: 0,
    });

    this.children.push(floorGrid);
    this.state.floorGrid = floorGrid;

    this.objectColors = ["#0043E0", "#C400E0", "#E03016", "#7EE016", "#0BE07B"];
  }

  // Fills any area between the boundary of the room and the bounding box of the RoomObject itself with a box. Returns that list of boxes
  _getOutOfBoundsBoxes() {
    const boxes = [];
    // Loop over boundary edges
    for (let i = 0; i < this.boundaryPoints.length; i++) {
      const p1 = this.boundaryPoints[i];
      const p2 = this.boundaryPoints[
        i === this.boundaryPoints.length - 1 ? 0 : i + 1
      ];
      // Check if edge is a vertical line - Only need to make boxes for either all vertical lines or all horizontal lines, not both
      if (Vector2.floatEquals(p1.x, p2.x)) {
        // Check if edge is lined up with corresponding edge of RoomObject. If not, create a box
        const direction = p2.y > p1.y ? 1 : -1;
        if (direction > 0 && !Vector2.floatEquals(p1.x, this.size.x)) {
          boxes.push({
            p1: new Vector2(p1.x, p1.y),
            p2: new Vector2(this.size.x, p2.y),
          });
        } else if (direction < 0 && !Vector2.floatEquals(p1.x, 0)) {
          boxes.push({
            p1: new Vector2(0, p2.y),
            p2: new Vector2(p1.x, p1.y),
          });
        }
      }
    }
    return boxes;
  }

  // Calculates and sets offset points (used so that when drawing room border the lines won't overlap into the room)
  _calculateOffsetPoints() {
    const offset = this.borderWidth / 2;
    this._offsetPoints = [];
    for (let i = 0; i < this.boundaryPoints.length; i++) {
      this._offsetPoints.push(
        new Vector2(this.boundaryPoints[i].x, this.boundaryPoints[i].y)
      );
    }
    this._offsetPoints.push(
      new Vector2(this.boundaryPoints[0].x, this.boundaryPoints[0].y)
    );
    for (let i = 0; i < this._offsetPoints.length - 1; i++) {
      const p1 = this._offsetPoints[i];
      const p2 = this._offsetPoints[i + 1];

      if (Vector2.floatEquals(p1.x, p2.x)) {
        // Vertical line
        const direction = p2.y > p1.y ? 1 : -1;
        p1.x = p1.x + offset * direction;
        p2.x = p2.x + offset * direction;
      } else {
        // Horizontal line
        const direction = p2.x > p1.x ? 1 : -1;
        p1.y = p1.y - offset * direction;
        p2.y = p2.y - offset * direction;
      }
    }
  }

  _fitRoomToCanvas() {
    const ctx = this.scene.ctx[this.canvasLayer];

    // Padding from edge of canvas for room outline
    this.boundaryOffset = ctx.canvas.width * 0.04;

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
    const usableCanvasWidth = ctx.canvas.width - 2 * this.boundaryOffset;
    const usableCanvasHeight = ctx.canvas.height - 2 * this.boundaryOffset;

    let roomAspect = maxWidth / maxHeight;
    let canvasAspect = ctx.canvas.width / ctx.canvas.height;

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
      ctx.canvas.width / 2 - globalSize.x / 2,
      ctx.canvas.height / 2 - globalSize.y / 2
    );
  }

  // Rounds num to the nearest multiple of given a number
  _roundToNearestMultipleOf(num, multipleOf) {
    const remainder = num % multipleOf;
    const divided = num / multipleOf;
    const rounded =
      remainder >= multipleOf / 2 ? Math.ceil(divided) : Math.floor(divided);
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
  _setContextTextStyle(ctx) {
    // Font size range
    const fontSize = 0.24;

    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = this.textColor;
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
      snapPosition: false,
      snapOffset: 0.2,
      canvasLayer: this.canvasLayer,
    });
    obj.setPosition(
      new Vector2(
        this.size.x / 2 - obj.size.x / 2,
        this.size.y / 2 - obj.size.y / 2
      )
    );

    this.children.push(obj);
  }

  _update() {
    // Resize if the canvas has been resized
    if (this.scene.resized) {
      this._fitRoomToCanvas();
    }
  }

  _draw(ctx) {
    const globalSize = this.getGlobalSize();

    // Draw caption text
    const captionText = "1 cell = 1 square foot";
    this._setContextTextStyle(ctx);
    const textWidth = ctx.measureText(captionText).width;
    if (textWidth < globalSize.x) {
      ctx.fillText(captionText, this.size.x / 2, this.size.y + 0.3);
    }
    // Fill the area outside of the room with the background color.
    ctx.beginPath();
    // First outline this objects border path - Clockwise order
    const offset = this.borderWidth;
    ctx.moveTo(-offset, -offset);
    ctx.lineTo(this.size.x + offset, -offset);
    ctx.lineTo(this.size.x + offset, this.size.y + offset);
    ctx.lineTo(-offset, this.size.y + offset);
    ctx.lineTo(-offset, -offset);
    ctx.closePath();

    // Now outline the room border path using the given points - Counter clockwise order (reverse of the clockwise order they are given in)
    for (let i = this.boundaryPoints.length - 1; i > 0; i--) {
      const p1 = this.boundaryPoints[i];
      const p2 = this.boundaryPoints[i - 1];

      if (i === this.boundaryPoints.length - 1) {
        ctx.moveTo(p1.x, p1.y);
      }
      ctx.lineTo(p2.x, p2.y);
    }
    ctx.closePath();

    ctx.fillStyle = this.backgroundColor;
    ctx.fill();

    // Now actually draw the room borders
    ctx.beginPath();
    for (let i = 0; i < this._offsetPoints.length - 1; i++) {
      const p1 = this._offsetPoints[i];
      const p2 = this._offsetPoints[i + 1];

      if (i === 0) {
        ctx.moveTo(p1.x, p1.y);
      }
      ctx.lineTo(p2.x, p2.y);
    }
    ctx.closePath();
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = this.borderWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    if (this.drawBoundaryBoxes) {
      for (let i = 0; i < this.boundaryBoxes.length; i++) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(
          this.boundaryBoxes[i].p1.x,
          this.boundaryBoxes[i].p1.y,
          this.boundaryBoxes[i].p2.x - this.boundaryBoxes[i].p1.x,
          this.boundaryBoxes[i].p2.y - this.boundaryBoxes[i].p1.y
        );
        ctx.globalAlpha = 1.0;
      }
    }
  }
}

export default RoomObject;
