import Collisions from "./Collisions";
import MouseController from "./MouseController";
import RoomGridObject from "./RoomGridObject";
import RoomRectObject from "./RoomRectObject";
import SceneObject from "./SceneObject";
import Vector2 from "./Vector2";

class RoomEditorObject extends SceneObject {
  constructor(props) {
    super(props);

    const {
      boundaryPoints,
      opacity,
      backgroundColor,
      onObjectsUpdated,
      onObjectSelected,
      fontFamily,
    } = props;

    // Map of item ids that have been added to room
    this.roomItems = new Map();

    this.backgroundColor = backgroundColor ?? "#fff";
    //this.backgroundColor = "red";
    this.textColor = "#222";
    this.borderColor = "#555";
    this.borderWidth = 0.07;
    this.opacity = opacity ?? 1.0;

    this.fontFamily = fontFamily;

    this.onObjectsUpdated = onObjectsUpdated ?? (() => {});
    this.onObjectSelected = onObjectSelected ?? (() => {});

    const floorGrid = new RoomGridObject({
      scene: this.scene,
      position: new Vector2(0, 0),
      size: new Vector2(this.size.x, this.size.y),
      scale: new Vector2(1, 1),
      opacity: 0.4,
      lineColor: "#888",
      lineWidth: 0.03,
      staticObject: true,
      zIndex: -1,
    });
    this.addChild(floorGrid);
    this.floorGrid = floorGrid;

    this.mouseController = new MouseController({
      watchedElement: this.scene.canvas,
      onMouseDown: this.onMouseDown.bind(this),
      onMouseMove: this.onMouseMove.bind(this),
      onMouseUp: this.onMouseUp.bind(this),
    });

    this.setBoundaries(boundaryPoints);

    this.selectedObject = null;

    this.objectColors = ["#0043E0", "#f28a00", "#C400E0", "#7EE016", "#0BE07B"];
    this.objectColorCounter = 0;

    // Set to true when item zIndexes need to be updated (e.g. after an item is selected)
    this._needNormalizeItemZIndexes = false;
    /* Set if selected object's position has been updated. onObjectUpdated() callback will 
    then be called on next update() cycle with updated position. Hopefully this reduces 
    unnecessary calls to onObjectUpdated */
    this._selectedObjectPositionUpdated = false;
  }

  setBoundaries(boundaryPoints) {
    // Create copies of the points since we don't want to reference the passed in objects themselves
    const copied = [];
    for (let i = 0; i < boundaryPoints.length; i++) {
      copied.push(new Vector2(boundaryPoints[i].x, boundaryPoints[i].y));
    }

    this.boundaryPoints = copied;
    this._offsetPoints = [];

    this._fitRoomToCanvas();
    this._calculateOffsetPoints();

    // Update size of grid to match any changes to size made in _fitRoomToCanvas()
    this.floorGrid.size = new Vector2(this.size.x, this.size.y);
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
    const ctx = this.scene.ctx;

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

  // Ensures that item zIndexes aren't larger than necessary.
  _normalizeItemZIndexes() {
    const sortedItems = [...this.roomItems.values()].sort(
      (a, b) => a.zIndex - b.zIndex
    );
    const updated = [];
    for (let i = 0; i < sortedItems.length; i++) {
      const item = sortedItems[i];
      if (item.zIndex !== i) {
        item.zIndex = i;
        updated.push({ id: item.id, updated: { zIndex: item.zIndex } });
      }
    }
    if (updated.length > 0) {
      this.onObjectsUpdated(updated);
    }
  }

  // Mouse callbacks that are passed to mouse controller
  onMouseDown(position) {
    // Get the object indices that were under the click and sort in order of descending zIndex so that highest object takes priority
    const clicked = this._getChildrenIndicesAtPosition(position).sort(
      (a, b) => {
        return this.children[b].zIndex - this.children[a].zIndex;
      }
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
            // Set zIndex to something very large so that when item zIndexes are normalized, this item is on top
            obj.zIndex = Infinity;

            this._needNormalizeItemZIndexes = true;

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
      this._selectedObjectPositionUpdated = true;
    }
  }
  onMouseUp() {}

  // Takes name, dimensions, color and adds a new item to the room object/scene. Returns true if item was successfully added, false otherwise
  addItemToRoom({
    id,
    name,
    width,
    height,
    position,
    rotation,
    movementLocked,
    zIndex,
    visible,
  }) {
    // Don't add object if another already exists with given id
    if (id && this.roomItems.has(id)) {
      return false;
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
      opacity: 0.6,
      nameText: name ?? "New Item",
      staticObject: false,
      snapPosition: false,
      snapOffset: 0.2,
      movementLocked: movementLocked ?? false,
      fontFamily: this.fontFamily,
      zIndex: zIndex ?? 0,
    });
    this.roomItems.set(obj.id, obj);

    // If item has visible property, actually add it to scene
    if (visible) {
      this.addChild(obj);
    }

    // If new position was assigned, call
    if (assignPosition) {
      this.onObjectsUpdated([{ id: id, updated: { position: position } }]);
    }

    // Normalize zIndexes of items
    this._needNormalizeItemZIndexes = true;

    return true;
  }

  // Updates object in room. Returns true if successful false if not
  updateRoomItem(
    id,
    { position, name, width, height, rotation, movementLocked, zIndex, visible }
  ) {
    const obj = this.roomItems.get(id);
    if (!obj) {
      return false;
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
    if (zIndex !== undefined) {
      obj.zIndex = zIndex;
    }
    if (visible !== undefined) {
      if (visible) {
        try {
          this.addChild(obj);
        } catch (err) {
          console.warn(`Can't show item ${id}. ${err.message}`);
        }
      } else {
        try {
          this.removeChild(obj);
        } catch (err) {
          console.warn(`Can't hide item ${id}. ${err.message}`);
        }
      }
    }
    return true;
  }

  // Removes item from room. Returns true if successful, false if not.
  removeItemFromRoom(id) {
    const obj = this.roomItems.get(id);
    if (obj === undefined) return false;
    if (this.selectedObject && this.selectedObject.id === id) {
      this.selectedObject = null;
    }

    // Remove from scene if obj is in scene (visible in editor)
    if (this.scene.hasObjectWithID(id)) {
      this.removeChild(obj);
    }

    this.roomItems.delete(id);

    // Normalize zIndexes of items
    this._needNormalizeItemZIndexes = true;

    return true;
  }

  update() {
    // Resize if the canvas has been resized
    if (this.scene.resized) {
      this._fitRoomToCanvas();
    }

    // Update room item zIndexes if necessary
    if (this._needNormalizeItemZIndexes) {
      this._normalizeItemZIndexes();
      this._needNormalizeItemZIndexes = false;
    }

    // Send updates to selected object position if any exist
    if (this._selectedObjectPositionUpdated) {
      this.onObjectsUpdated([
        {
          id: this.selectedObject.id,
          updated: {
            position: this.selectedObject.position,
          },
        },
      ]);
      this._selectedObjectPositionUpdated = false;
    }
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

  draw(ctx) {
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
  }
}

export default RoomEditorObject;
