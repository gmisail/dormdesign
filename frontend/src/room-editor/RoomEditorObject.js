import Collisions from "./Collisions";
import MouseController from "./MouseController";
import RoomBoundsObject from "./RoomBoundsObject";
import RoomGridObject from "./RoomGridObject";
import RoomRectObject from "./RoomRectObject";
import SceneObject from "./SceneObject";
import Vector2 from "./Vector2";

class RoomEditorObject extends SceneObject {
  constructor(props) {
    super(props);

    const {
      boundaryPoints,
      boundaryColor,
      boundaryWidth,
      gridLineColor,
      gridLineWidth,
      gridCellSize,
      gridOpacity,
      backgroundColor,
      outsideBoundaryColor,
      onObjectsUpdated,
      onObjectSelected,
      onBoundsUpdated,
      onBoundaryPointSelected,
      textColor,
      fontFamily,
    } = props;

    this.size = new Vector2(100, 100);
    this.origin = new Vector2(0.5, 0.5);
    this.position = new Vector2(
      this.scene.canvas.width / 2,
      this.scene.canvas.height / 2
    );

    // Map of item ids that have been added to room
    this.roomItems = new Map();

    this.backgroundColor = backgroundColor ?? "#fff";
    this.outsideBoundaryColor = outsideBoundaryColor ?? "#000";

    this.fontFamily = fontFamily;
    this.textColor = textColor ?? "#222";

    this.onObjectsUpdated = onObjectsUpdated ?? (() => {});
    this.onObjectSelected = onObjectSelected ?? (() => {});

    this.floorGrid = new RoomGridObject({
      scene: this.scene,
      position: new Vector2(
        -this.size.x * this.origin.x,
        -this.size.y * this.origin.y
      ),
      size: new Vector2(this.size.x, this.size.y),
      scale: new Vector2(1, 1),
      opacity: gridOpacity ?? 1.0,
      backgroundColor: this.backgroundColor,
      lineColor: gridLineColor ?? "#ccc",
      lineWidth: gridLineWidth ?? 0.03,
      cellSize: gridCellSize ?? 1,
      staticObject: true,
      zIndex: -1,
    });
    this.addChild(this.floorGrid);

    this.bounds = new RoomBoundsObject({
      scene: this.scene,
      points: boundaryPoints ?? [],
      color: boundaryColor ?? "#555",
      edgeWidth: boundaryWidth ?? 0.07,
      onPointSelected: onBoundaryPointSelected,
      onPointsUpdated: onBoundsUpdated,
    });
    this.addChild(this.bounds);

    this.mouseController = new MouseController({
      watchedElement: this.scene.canvas,
      onMouseDown: this.onMouseDown.bind(this),
      onMouseMove: this.onMouseMove.bind(this),
      onMouseUp: this.onMouseUp.bind(this),
      onScroll: this.onScroll.bind(this),
    });
    this.panning = false;
    this.panSpeed = 1.0;
    this.zoomSpeed = -0.04;

    this.selectedObject = null;

    this.objectColors = ["#0043E0", "#f28a00", "#C400E0", "#7EE016", "#0BE07B"];
    this.objectColorCounter = 0;

    // Set to true when item zIndexes need to be updated (e.g. after an item is selected)
    this._needNormalizeItemZIndexes = false;
    /* Set if selected object's position has been updated. onObjectUpdated() callback will 
    then be called on next update() cycle with updated position. Hopefully this reduces 
    unnecessary calls to onObjectUpdated */
    this._selectedObjectPositionUpdated = false;

    this.centerView();
  }

  setScale(scale) {
    const limitMinX = this.scene.canvas.width / this.size.x;
    const limitMinY = this.scene.canvas.height / this.size.y;
    const min = 30;
    const max = 200;

    this.scale = new Vector2(
      Math.min(max, Math.max(scale.x, limitMinX, min)),
      Math.min(max, Math.max(scale.y, limitMinY, min))
    );
  }

  // Scales object by dScale about provided point (point should be in the parent's local coordinate system)
  scaleAbout(dScale, point) {
    const oldScale = this.scale;
    this.setScale(
      new Vector2(this.scale.x * dScale.x, this.scale.y * dScale.y)
    );
    // Amount that object has actually been scaled
    dScale = new Vector2(this.scale.x / oldScale.x, this.scale.y / oldScale.y);
    // Vector from the origin of this object to the point where the point is
    const relativeToOrigin = new Vector2(
      point.x - this.position.x,
      point.y - this.position.y
    );
    // Scaled version of previous vector
    const relativeToOriginScaled = new Vector2(
      relativeToOrigin.x * dScale.x,
      relativeToOrigin.y * dScale.y
    );
    // Calculate the amount to move the object using the difference between the original and scaled vectors
    this.position = new Vector2(
      this.position.x - (relativeToOriginScaled.x - relativeToOrigin.x),
      this.position.y - (relativeToOriginScaled.y - relativeToOrigin.y)
    );
  }

  // Scale and position the editor so that the entire room (boundary) is in view
  centerView() {
    const ctx = this.scene.ctx;
    // Space around room boundaries
    const padding = {
      x: 0.2 * ctx.canvas.width,
      y: 0.2 * ctx.canvas.height,
    };
    let xMax;
    let yMax;
    let xMin;
    let yMin;
    for (let i = 0; i < this.bounds.points.length; i++) {
      if (xMax === undefined || this.bounds.points[i].x > xMax) {
        xMax = this.bounds.points[i].x;
      }
      if (yMax === undefined || this.bounds.points[i].y > yMax) {
        yMax = this.bounds.points[i].y;
      }
      if (xMin === undefined || this.bounds.points[i].x < xMin) {
        xMin = this.bounds.points[i].x;
      }
      if (yMin === undefined || this.bounds.points[i].y < yMin) {
        yMin = this.bounds.points[i].y;
      }
    }
    xMax = xMax ?? 0;
    yMax = yMax ?? 0;
    xMin = xMin ?? 0;
    yMin = yMin ?? 0;
    const roomWidth = xMax - xMin;
    const roomHeight = yMax - yMin;
    const roomAspect = roomWidth / roomHeight;

    const usableCanvasWidth = ctx.canvas.width - padding.x;
    const usableCanvasHeight = ctx.canvas.height - padding.y;
    const canvasAspect = usableCanvasWidth / usableCanvasHeight;

    // Compare canvas aspect ratio to bounds aspect ratio in order to fit bounds in canvas
    if (roomAspect > canvasAspect) {
      if (roomWidth === 0) {
        // Prevent divide-by-zero
        this.setScale(new Vector2(0, 0));
      } else {
        this.setScale(
          new Vector2(
            usableCanvasWidth / roomWidth,
            usableCanvasWidth / roomWidth
          )
        );
      }
    } else {
      // Prevent divide-by-zero
      if (roomHeight === 0) {
        this.setScale(new Vector2(0, 0));
      } else {
        this.setScale(
          new Vector2(
            usableCanvasHeight / roomHeight,
            usableCanvasHeight / roomHeight
          )
        );
      }
    }
    // this.size = new Vector2(roomWidth, roomHeight);
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

    // Set the position so the view is centered on the object (room bounds)
    const roomCenterGlobal = this.localToGlobalPoint(
      new Vector2(xMin + roomWidth / 2, yMin + roomHeight / 2)
    );
    const relativeToOrigin = new Vector2(
      roomCenterGlobal.x - this.position.x,
      roomCenterGlobal.y - this.position.y
    );
    this.position = new Vector2(
      ctx.canvas.width / 2 - relativeToOrigin.x,
      ctx.canvas.height / 2 - relativeToOrigin.y
    );
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
        if (this.roomItems.has(obj.id) && !this.bounds.editing) {
          // Clicked room item (don't allow if bounds are being edited)
          this.selectItem(obj.id);
          return;
        } else if (obj.id === this.floorGrid.id) {
          // Clicked floor grid
          this.panning = true;
        }
      }
    }
    if (this.selectedObject) {
      this.selectItem(null);
    }
  }
  onMouseMove(delta) {
    if (this.mouseController.pressed && !this.bounds.movingPoint) {
      if (this.selectedObject && !this.selectedObject.staticObject) {
        const selectedObject = this.selectedObject;

        if (selectedObject.movementLocked) {
          return;
        }

        const initialPosition = new Vector2(
          selectedObject.position.x,
          selectedObject.position.y
        );
        const unsnappedPos = selectedObject.getUnsnappedPosition();
        const globalPos = this.localToGlobalPoint(unsnappedPos);

        selectedObject.setPosition(
          this.globalToLocalPoint(
            new Vector2(globalPos.x + delta.x, globalPos.y + delta.y)
          )
        );

        const finalPosition = selectedObject.position;
        if (
          initialPosition.x == finalPosition.x &&
          initialPosition.y == finalPosition.y
        )
          return;

        this._selectedObjectPositionUpdated = true;
      }
      if (this.panning) {
        this.position = new Vector2(
          this.position.x + delta.x * this.panSpeed,
          this.position.y + delta.y * this.panSpeed
        );
      }
    }
  }

  onMouseUp() {
    this.panning = false;
  }

  onScroll(dx, dy, mousePosition) {
    if (isNaN(dx)) dx = 0;
    if (isNaN(dy)) dy = 0;

    // Limit scroll dy since browsers seem to have vastly different scroll speeds
    dy = Math.max(-3, Math.min(dy, 3));

    this.scaleAbout(
      new Vector2(1 + dy * this.zoomSpeed, 1 + dy * this.zoomSpeed),
      mousePosition
    );
  }

  selectItem(id) {
    if (id === null) {
      this.selectedObject.selected = false;
      this.selectedObject = null;
      this.onObjectSelected(null);
      return;
    }
    const obj = this.roomItems.get(id);
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
  }

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
    color,
  }) {
    // Don't add object if another already exists with given id
    if (id && this.roomItems.has(id)) {
      return false;
    }
    color = color ?? this.objectColors[this.objectColorCounter];
    this.objectColorCounter++;
    if (this.objectColorCounter === this.objectColors.length) {
      this.objectColorCounter = 0;
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
      snapPosition: true,
      snapOffset: 0.05,
      movementLocked: movementLocked ?? false,
      fontFamily: this.fontFamily,
      zIndex: zIndex ?? 0,
    });
    this.roomItems.set(obj.id, obj);

    // If item has visible property, actually add it to scene
    if (visible) {
      this.addChild(obj);
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
    if (this.scene.resized && this.autoFitToCanvas) {
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

    // Prevent grid from panning out of view
    const bbox = this.getBoundingBox();
    const actualSize = new Vector2(
      bbox.p2.x - bbox.p1.x,
      bbox.p2.y - bbox.p1.y
    );
    const restrictedPosition = new Vector2(
      Math.min(
        actualSize.x * (1 - this.origin.x),
        Math.max(
          this.scene.canvas.width - actualSize.x * this.origin.x,
          this.position.x
        )
      ),
      Math.min(
        actualSize.y * (1 - this.origin.y),
        Math.max(
          this.scene.canvas.height - actualSize.y * this.origin.y,
          this.position.y
        )
      )
    );
    if (
      !Vector2.floatEquals(restrictedPosition.x, this.position.x) ||
      !Vector2.floatEquals(restrictedPosition.y, this.position.y)
    ) {
      this.position = restrictedPosition;
    }

    // Check for room item edge collisions
    for (let i = 0; i < this.children.length; i++) {
      const obj = this.children[i];
      // Ignore objects that aren't room items
      if (!this.roomItems.has(obj.id)) continue;

      // Restrict position to parent borders
      let bbox = obj.getBoundingBox();
      const actualSize = new Vector2(
        bbox.p2.x - bbox.p1.x,
        bbox.p2.y - bbox.p1.y
      );
      const restrictedPosition = new Vector2(
        Math.min(
          this.size.x * (1 - this.origin.x) - actualSize.x * (1 - obj.origin.x),
          Math.max(
            -this.size.x * this.origin.x + actualSize.x * obj.origin.x,
            obj.position.x
          )
        ),
        Math.min(
          this.size.y * (1 - this.origin.y) - actualSize.y * (1 - obj.origin.y),
          Math.max(
            -this.size.y * this.origin.y + actualSize.y * obj.origin.y,
            obj.position.y
          )
        )
      );

      if (
        !Vector2.floatEquals(restrictedPosition.x, obj.position.x) ||
        !Vector2.floatEquals(restrictedPosition.y, obj.position.y)
      ) {
        obj.position = restrictedPosition;
      }

      // Check for collisions. Currently only checks if object collides with one of the room boundary edges.
      // Small "error" allows for things such as a 1' x 1' obj fitting in a 1' x 1' space without counting as collision
      const error = 0.015;
      bbox.p1.x += error;
      bbox.p1.y += error;
      bbox.p2.x -= error;
      bbox.p2.y -= error;
      obj.outOfBounds = false;
      if (this.bounds.points) {
        for (let i = 0; i < this.bounds.points.length; i++) {
          const v1 = this.bounds.points[i];
          const v2 = this.bounds.points[
            i === this.bounds.points.length - 1 ? 0 : i + 1
          ];
          if (Collisions.segmentIntersectsRect(v1, v2, bbox.p1, bbox.p2)) {
            obj.outOfBounds = true;
          }
        }
      }
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

  draw(ctx) {}
}

export default RoomEditorObject;
