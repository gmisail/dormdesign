import SceneObject from "./SceneObject";
import MouseController from "./MouseController";
import Collisions from "./Collisions";
import RoomRectObject from "./RoomRectObject";
import RoomGridObject from "./RoomGridObject";
import Vector2 from "./Vector2";

class RoomEditorObject extends SceneObject {
  constructor({
    scene,
    id,
    boundaryPoints,
    opacity,
    canvasLayer,
    backgroundColor,
    onObjectUpdated,
    onObjectSelected,
  }) {
    super({
      scene: scene,
      id: id,
      parent: null,
      position: new Vector2(0, 0),
      size: new Vector2(0, 0),
      scale: new Vector2(1, 1),
      staticObject: true,
      canvasLayer: canvasLayer,
    });

    // Map of item ids that have been added to room
    this.roomItems = new Set();

    // Points that define room boundary (measured in feet). Must be in clockwise order
    this.boundaryPoints = boundaryPoints;
    this._offsetPoints = [];

    this.backgroundColor = backgroundColor ?? "#fff";
    this.textColor = "#222";
    this.borderColor = "#555";
    this.borderWidth = 0.07;
    this.opacity = opacity ?? 1.0;

    this.onObjectUpdated = onObjectUpdated;
    this.onObjectSelected = onObjectSelected;

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

    const floorGrid = new RoomGridObject({
      scene: this.scene,
      position: new Vector2(0, 0),
      size: new Vector2(this.size.x, this.size.y),
      scale: new Vector2(1, 1),
      opacity: 0.4,
      lineColor: "#888",
      lineWidth: 0.03,
      staticObject: true,
      canvasLayer: 0,
    });
    this.addChild(floorGrid);
    this.floorGrid = floorGrid;

    this.selectedObject = null;

    this.objectColors = ["#0043E0", "#f28a00", "#C400E0", "#7EE016", "#0BE07B"];
    this.objectColorCounter = 0;
  }

  // Fills any area between the boundary of the room and the bounding box of the RoomEditorObject itself with a box. Returns that list of boxes
  _getOutOfBoundsBoxes() {
    const boxes = [];

    /* Offset represents distance past the size of the room. Used since some boundary edges are flush with
    the edge of the room and with the current method they wouldn't get any rects beneath them */
    const offset = 0.5;
    const directions = [];
    // Loop over boundary edges
    for (let i = 0; i < this.boundaryPoints.length; i++) {
      const p1 = this.boundaryPoints[i];
      const p2 = this.boundaryPoints[
        i === this.boundaryPoints.length - 1 ? 0 : i + 1
      ];
      let direction;
      let box;
      if (Vector2.floatEquals(p1.x, p2.x)) {
        // Vertical line
        direction = p2.y > p1.y ? 1 : -1;
        if (direction > 0) {
          // Down line
          box = {
            p1: new Vector2(p1.x, p1.y),
            p2: new Vector2(this.size.x + offset, p2.y),
          };
        } else if (direction < 0) {
          // Up line
          box = {
            p1: new Vector2(-offset, p2.y),
            p2: new Vector2(p1.x, p1.y),
          };
        }
      } else {
        // Horizontal line
        direction = p2.x > p1.x ? 1 : -1;
        if (direction > 0) {
          // Right line
          box = {
            p1: new Vector2(p1.x, -offset),
            p2: new Vector2(p2.x, p2.y),
          };
        } else if (direction < 0) {
          // Left line
          box = {
            p1: new Vector2(p2.x, p2.y),
            p2: new Vector2(p1.x, this.size.y + offset),
          };
        }
      }
      // Check previous two boxes for overlap to see if this box would be redundant (overlap other boxes)
      let redundant = false;
      for (let i = boxes.length - 1; i >= boxes.length - 2 && i >= 0; i--) {
        if (Collisions.rectInRect(box.p1, box.p2, boxes[i].p1, boxes[i].p2)) {
          redundant = true;
        }
      }
      // When on last edge, also check first two boxes
      if (i === this.boundaryPoints.length - 1) {
        for (let i = 0; i < 2 && i < boxes.length; i++) {
          if (Collisions.rectInRect(box.p1, box.p2, boxes[i].p1, boxes[i].p2)) {
            redundant = true;
          }
        }
      }
      if (!redundant) {
        boxes.push(box);
      }
      directions.push(direction);
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
    // Add reference to first point to end of list so its properly updated by last edge
    this._offsetPoints.push(this._offsetPoints[0]);
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

    // Padding from edge of canvas
    const padding = {
      top: ctx.canvas.width * 0.02,
      bottom: ctx.canvas.width * 0.02,
      left: ctx.canvas.width * 0.02,
      right: ctx.canvas.width * 0.02,
    };

    let xMax;
    let yMax;
    let xMin;
    let yMin;
    for (let i = 0; i < this.boundaryPoints.length; i++) {
      if (xMax === undefined || this.boundaryPoints[i].x > xMax) {
        xMax = this.boundaryPoints[i].x;
      }
      if (yMax === undefined || this.boundaryPoints[i].y > yMax) {
        yMax = this.boundaryPoints[i].y;
      }
      if (xMin === undefined || this.boundaryPoints[i].x < xMin) {
        xMin = this.boundaryPoints[i].x;
      }
      if (yMin === undefined || this.boundaryPoints[i].y < yMin) {
        yMin = this.boundaryPoints[i].y;
      }
    }

    // Translate points so min is at 0,0
    for (let i = 0; i < this.boundaryPoints.length; i++) {
      this.boundaryPoints[i].x -= xMin;
      this.boundaryPoints[i].y -= yMin;
    }

    const roomWidth = xMax - xMin;
    const roomHeight = yMax - yMin;

    let roomAspect = roomWidth / roomHeight;
    let canvasAspect = ctx.canvas.width / ctx.canvas.height;

    const usableCanvasWidth = ctx.canvas.width - (padding.left + padding.right);
    const usableCanvasHeight =
      ctx.canvas.height - (padding.top + padding.bottom);

    // Compare canvas aspect ratio to room aspect ratio in to make sure room will fit in canvas
    if (roomAspect > canvasAspect) {
      this.scale = new Vector2(
        usableCanvasWidth / roomWidth,
        usableCanvasWidth / roomWidth
      );
    } else {
      this.scale = new Vector2(
        usableCanvasHeight / roomHeight,
        usableCanvasHeight / roomHeight
      );
    }

    this.size.x = roomWidth;
    this.size.y = roomHeight;

    const bbox = this.getGlobalBoundingBox();
    const globalSize = { x: bbox.p2.x - bbox.p1.x, y: bbox.p2.y - bbox.p1.y };

    let position = {
      x: ctx.canvas.width / 2 - globalSize.x / 2,
      y: ctx.canvas.height / 2 - globalSize.y / 2,
    };

    // Only adjust position for padding if the padding actually affects it
    if (padding.left > position.x) {
      position.x += padding.left - position.x;
    }
    if (padding.top > position.y) {
      position.y += padding.top - position.y;
    }

    this.position = new Vector2(position.x, position.y);
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
    // Get the object indices that were under the click and sort them in descending order so that the one on top is selected
    const clicked = this._getChildrenIndicesAtPosition(position).sort(
      (a, b) => b - a
    );
    if (clicked.length > 0) {
      for (let i = 0; i < clicked.length; i++) {
        const obj = this.children[clicked[i]];
        // Only able to selected objects that have "selected" property
        if ("selected" in obj) {
          // Don't reselect if already selected
          if (this.selectedObject?.id !== obj.id) {
            if (this.selectedObject) {
              this.selectedObject.selected = false;
            }
            obj.selected = true;
            this.selectedObject = obj;
            // Move the selected object to the back of the children array so its drawn last (on top)
            this.children.push(this.children.splice(clicked[i], 1)[0]);
            this.onObjectSelected(obj);
          }
          return;
        }
      }
    }
    if (this.selectedObject) {
      this.selectedObject.selected = false;
      this.selectedObject = null;
      this.onObjectSelected(null);
    }
  }
  onMouseMove(delta) {
    if (this.selectedObject && !this.selectedObject.staticObject) {
      const selectedObject = this.selectedObject;
      if (selectedObject.movementLocked) {
        return;
      }
      const unsnappedPos = selectedObject.getUnsnappedPosition();
      const globalPos = selectedObject.localToGlobalPoint(unsnappedPos);
      selectedObject.setPosition(
        selectedObject.globalToLocalPoint(
          new Vector2(globalPos.x + delta.x, globalPos.y + delta.y)
        )
      );

      this.onObjectUpdated(selectedObject.id, {
        position: selectedObject.position,
      });
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
  addItemToRoom({
    id,
    name,
    width,
    height,
    position,
    rotation,
    movementLocked,
  }) {
    // Don't add object if another already exists with given id
    if (id && this.scene.objects.has(id)) {
      return undefined;
    }
    const color = this.objectColors[this.objectColorCounter];
    this.objectColorCounter++;
    if (this.objectColorCounter === this.objectColors.length) {
      this.objectColorCounter = 0;
    }

    // If no position given or position is invalid, assign a position in center of room
    let assignPosition = !position || !position.x || !position.y;
    if (assignPosition) {
      position = new Vector2(this.size.x / 2, this.size.y / 2);
    }
    const obj = new RoomRectObject({
      id: id,
      scene: this.scene,
      position: position,
      rotation: rotation ?? 0,
      size: new Vector2(width ?? 1, height ?? 1),
      color: color,
      opacity: 0.5,
      nameText: name ?? "New Item",
      staticObject: false,
      snapPosition: false,
      snapOffset: 0.2,
      canvasLayer: this.canvasLayer,
      movementLocked: movementLocked ?? false,
    });
    this.roomItems.add(obj.id);
    this.addChild(obj);

    // If position was assigned, call
    if (assignPosition) {
      this.onObjectUpdated(id, { position: position });
    }

    return obj;
  }

  // Updates object in room. Returns true if successful false if not
  updateRoomItem(
    id,
    { position, name, width, height, rotation, movementLocked }
  ) {
    const obj = this.scene.objects.get(id);
    if (!obj) {
      console.error("ERROR updating room item. Invalid object ID: " + id);
      return;
    }
    if (position && position.x && position.y) {
      obj.setPosition(new Vector2(position.x, position.y));
    }
    if (name) {
      obj.nameText = name;
    }
    // Allow null dimension values (but just set them to 1 in that case)
    if (width !== undefined && height !== undefined) {
      obj.size = new Vector2(width ?? 1, height ?? 1);
    }
    if (rotation !== undefined) {
      obj.rotation = rotation;
    }
    if (movementLocked !== undefined) {
      obj.movementLocked = movementLocked;
    }
  }

  removeItemFromRoom(id) {
    const obj = this.scene.objects.get(id);
    if (obj) {
      if (this.selectedObject && this.selectedObject.id === id) {
        this.selectedObject = null;
      }
      this.scene.removeObject(obj);
    }
    this.roomItems.delete(id);
  }

  _update() {
    // Resize if the canvas has been resized
    if (this.scene.resized) {
      this._fitRoomToCanvas();
    }
  }

  _draw(ctx) {
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
    ctx.lineJoin = "butt";
    ctx.lineCap = "butt";
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

export default RoomEditorObject;
