import Vector2 from "./Vector2";

class SceneObject {
  constructor({
    scene,
    id,
    position,
    size,
    scale,
    rotation,
    origin,
    staticObject,
    zIndex,
    debugDrawBoundingBox,
    debugDrawGlobalBoundingBox,
    debugDrawLocalBoundingBox,
    debugDrawLocalCoordinates,
    debugDrawCoordinateConversionTest,
  }) {
    this.scene = scene;
    this.id = id ?? scene.idCounter++;
    this._position = position ?? new Vector2(0, 0);
    this._scale = scale ?? new Vector2(1, 1);
    this._rotation = rotation ?? 0.0;
    this._size = size ?? new Vector2(0, 0);
    this._zIndex = zIndex ?? 0;
    this._origin = origin ?? new Vector2(0, 0);
    this.staticObject = staticObject ?? false;

    this.parent = null;
    this._children = [];
    // Flag that indicates _children needs to be sorted by zIndex next update
    this._updateDrawOrder = false;

    // Draws bounding box
    this.debugDrawBoundingBox = debugDrawBoundingBox ?? false;
    // Draws global bounding box
    this.debugDrawGlobalBoundingBox = debugDrawGlobalBoundingBox ?? false;
    // Draws local bounding box
    this.debugDrawLocalBoundingBox = debugDrawLocalBoundingBox ?? false;
    // Draws local coordinate system
    this.debugDrawLocalCoordinates = debugDrawLocalCoordinates ?? false;
    // Draws point conversion tests (all the points in the same location means success)
    this.debugDrawCoordinateConversionTest = debugDrawCoordinateConversionTest ?? false;

    this._updateTransform();
  }

  _calculateLocalTransform() {
    const matrix = new DOMMatrix([1, 0, 0, 1, 0, 0]);
    matrix.translateSelf(this._position.x, this._position.y);
    matrix.rotateSelf(0, 0, this._rotation);
    matrix.scaleSelf(this._scale.x, this._scale.y);

    return new DOMMatrixReadOnly(matrix);
  }

  // Calculates and returns the transformation matrix for this object using the parent's transformation matrix (if it has a parent. Otherwise uses identity).
  _calculateTransform() {
    let matrix;
    if (this.parent) {
      matrix = this.parent._transformMatrix.multiply(this._localTransformMatrix);
    } else {
      // If no parent, just return copy of local matrix
      matrix = new DOMMatrixReadOnly(this._localTransformMatrix);
    }
    return matrix;
  }

  // Updates the transformation matrix for this object and its children. If passed in false, won't update local transform matrix. Otherwise, it will.
  _updateTransform(updateLocal) {
    if (updateLocal === undefined || updateLocal === true) {
      this._localTransformMatrix = this._calculateLocalTransform();
    }
    this._transformMatrix = this._calculateTransform();
    for (let i = 0; i < this._children.length; i++) {
      this._children[i]._updateTransform(false);
    }
  }

  // Getters / Setters for SceneObjects. Note that for some of these values (the ones whose value is a vector), you can't set individual properties. i.e. don't do position.x = 2; position.y = 3. Instead do position = new Vector2(2, 3);
  get position() {
    return this._position;
  }
  get scale() {
    return this._scale;
  }
  get rotation() {
    return this._rotation;
  }
  get origin() {
    return this._origin;
  }
  get size() {
    return this._size;
  }
  get zIndex() {
    return this._zIndex;
  }

  get children() {
    return this._children;
  }

  set position(vector) {
    this._position = vector;
    this._updateTransform();
  }
  set scale(vector) {
    this._scale = vector;
    this._updateTransform();
  }
  set rotation(degs) {
    this._rotation = degs;
    // Prevent unnecessary small/large rotation values
    if (this._rotation >= 360) {
      this._rotation = this._rotation - 360;
    } else if (this._rotation < 0) {
      this._rotation = 360 + this._rotation;
    }

    this._updateTransform();
  }
  // Expects vector with values between 0 and 1
  set origin(vector) {
    vector.x = Math.min(1, Math.max(0, vector.x));
    vector.y = Math.min(1, Math.max(0, vector.y));
    this._origin = vector;
    this._updateTransform();
  }
  set size(vector) {
    this._size = vector;
    this._updateTransform();
  }
  set zIndex(val) {
    this._zIndex = val;
    this._updateDrawOrder = true;
  }

  addChild(obj) {
    this.scene._addObject(obj);
    this._children.push(obj);
    obj.parent = this;
    obj._updateTransform();
    this._updateDrawOrder = true;
  }

  removeChild(obj) {
    this.scene._removeObject(obj);
    this._children = this._children.filter((x) => x.id !== obj.id);
    obj.parent = null;
    obj._updateTransform();
  }

  _calculateDrawOrder() {
    this._children = this._children.sort((a, b) => {
      return a._zIndex - b._zIndex;
    });
  }

  // This object's BBOX in its parent's local coordinate system
  getBoundingBox() {
    // Use local transform matrix
    let matrix = this._localTransformMatrix;
    // Offset the origin to line up with the drawn matrix;
    matrix = matrix.translate(-this._origin.x * this._size.x, -this._origin.y * this._size.y);

    // Multiply the 4 corners of the rect by the matrix
    const c1 = new DOMPoint(0, 0).matrixTransform(matrix);
    const c2 = new DOMPoint(this._size.x, 0).matrixTransform(matrix);
    const c3 = new DOMPoint(this._size.x, this._size.y).matrixTransform(matrix);
    const c4 = new DOMPoint(0, this._size.y).matrixTransform(matrix);
    return {
      p1: new Vector2(Math.min(c1.x, c2.x, c3.x, c4.x), Math.min(c1.y, c2.y, c3.y, c4.y)),
      p2: new Vector2(Math.max(c1.x, c2.x, c3.x, c4.x), Math.max(c1.y, c2.y, c3.y, c4.y)),
    };
  }

  // This object's BBOX in its own local coordinate system
  getLocalBoundingBox() {
    const width = this.size.x;
    const height = this.size.y;
    const x1 = -width * this.origin.x;
    const y1 = -height * this.origin.y;
    return {
      p1: new Vector2(x1, y1),
      p2: new Vector2(x1 + width, y1 + height),
    };
  }

  // This object's BBOX in the global coordinate system
  getGlobalBoundingBox() {
    // Use global transform matrix
    let matrix = this._transformMatrix;
    // Offset the origin to line up with the drawn matrix;
    matrix = matrix.translate(-this._origin.x * this._size.x, -this._origin.y * this._size.y);

    // Multiply the 4 corners of the obj by the matrix
    const c1 = new DOMPoint(0, 0).matrixTransform(matrix);
    const c2 = new DOMPoint(this._size.x, 0).matrixTransform(matrix);
    const c3 = new DOMPoint(this._size.x, this._size.y).matrixTransform(matrix);
    const c4 = new DOMPoint(0, this._size.y).matrixTransform(matrix);
    return {
      p1: new Vector2(Math.min(c1.x, c2.x, c3.x, c4.x), Math.min(c1.y, c2.y, c3.y, c4.y)),
      p2: new Vector2(Math.max(c1.x, c2.x, c3.x, c4.x), Math.max(c1.y, c2.y, c3.y, c4.y)),
    };
  }

  localToGlobalPoint(point) {
    // Multiply point by transform matrix
    const matrix = this._transformMatrix;
    const globalPoint = new DOMPoint(point.x, point.y).matrixTransform(matrix);
    return new Vector2(globalPoint.x, globalPoint.y);
  }

  globalToLocalPoint(point) {
    // Multiply point by inverse of transform matrix
    const matrix = this._transformMatrix.inverse();
    const localPoint = new DOMPoint(point.x, point.y).matrixTransform(matrix);
    return new Vector2(localPoint.x, localPoint.y);
  }

  // Update function that can be overriden in objects that inherit SceneObject
  update() {}

  // Private update function
  _update() {
    // Recalculate children draw order if needed
    if (this._updateDrawOrder) {
      this._calculateDrawOrder();
    }

    this.update();

    // Update children
    for (let i = 0; i < this._children.length; i++) {
      this._children[i]._update();
    }
  }

  // Draw function that can be overriden in objects that inherit SceneObject
  draw(ctx) {}

  // Private draw function
  _draw() {
    const ctx = this.scene.ctx;

    // Child objects with zIndex < 0
    const negativeZIndex = [];
    // Child objects with zIndex >= 0
    const positiveZIndex = [];
    for (let i = 0; i < this._children.length; i++) {
      if (this._children[i]._zIndex >= 0) {
        positiveZIndex.push(i);
      } else {
        negativeZIndex.push(i);
      }
    }

    // First draw all children with zIndex < 0 so they will be underneath this object
    for (let i = 0; i < negativeZIndex.length; i++) {
      this._children[negativeZIndex[i]]._draw();
    }

    // Draw this object.
    ctx.save();
    // Set context transform to this objects transformation matrix
    ctx.setTransform(this._transformMatrix);

    // Draws axes of local coordinate system (for debugging)
    if (this.debugDrawLocalCoordinates) {
      ctx.fillStyle = "#000";
      ctx.globalAlpha = 0.4;
      const step = 20;
      const radius = 2;
      for (let i = -10; i <= 10; i++) {
        ctx.beginPath();
        ctx.arc(step * i, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, step * i, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (this.debugDrawLocalBoundingBox) {
      const bbox = this.getLocalBoundingBox();
      const w = bbox.p2.x - bbox.p1.x;
      const h = bbox.p2.y - bbox.p1.y;
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 3;
      ctx.globalAlpha = 1.0;
      ctx.strokeRect(bbox.p1.x, bbox.p1.y, w, h);
    }

    if (this.debugDrawCoordinateConversionTest) {
      const TEST_POINT = new Vector2(
        this.size.x * (1 - this.origin.x),
        this.size.y * (1 - this.origin.y)
      );
      const TEST_POINT_GLOBAL = this.localToGlobalPoint(TEST_POINT);
      const TEST_POINT_REVERTED = this.globalToLocalPoint(TEST_POINT_GLOBAL);
      ctx.beginPath();
      ctx.arc(TEST_POINT.x, TEST_POINT.y, 15, 0, Math.PI * 2);
      ctx.fillStyle = "blue";
      ctx.globalAlpha = 1.0;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(TEST_POINT_REVERTED.x, TEST_POINT_REVERTED.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = "green";
      ctx.globalAlpha = 1.0;
      ctx.fill();
    }

    /* Offset the origin for drawing 
    (we don't apply this to the original transformMatrix so that the local coordinate system uses the correct origin)
    */
    ctx.translate(-this._origin.x * this._size.x, -this._origin.y * this._size.y);

    this.draw(ctx);
    // Restore context state to what it was pre-draw
    ctx.restore();

    if (this.debugDrawBoundingBox) {
      ctx.save();

      if (this.parent) {
        ctx.setTransform(this.parent._transformMatrix);
      }
      const bbox = this.getBoundingBox();
      const w = bbox.p2.x - bbox.p1.x;
      const h = bbox.p2.y - bbox.p1.y;
      ctx.strokeStyle = "purple";
      ctx.lineWidth = 7;
      ctx.strokeRect(bbox.p1.x, bbox.p1.y, w, h);

      ctx.restore();
    }

    if (this.debugDrawGlobalBoundingBox) {
      ctx.save();

      const bbox = this.getGlobalBoundingBox();
      const w = bbox.p2.x - bbox.p1.x;
      const h = bbox.p2.y - bbox.p1.y;
      ctx.strokeStyle = "red";
      ctx.lineWidth = 3;
      ctx.strokeRect(bbox.p1.x, bbox.p1.y, w, h);

      ctx.restore();
    }

    if (this.debugDrawCoordinateConversionTest) {
      ctx.save();

      const TEST_POINT = new Vector2(
        this.size.x * (1 - this.origin.x),
        this.size.y * (1 - this.origin.y)
      );
      const TEST_POINT_GLOBAL = this.localToGlobalPoint(TEST_POINT);

      ctx.beginPath();
      ctx.arc(TEST_POINT_GLOBAL.x, TEST_POINT_GLOBAL.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "orange";
      ctx.globalAlpha = 1;
      ctx.fill();

      ctx.restore();
    }

    // Then draw children with zIndex >= 0 so they will be above this object
    for (let i = 0; i < positiveZIndex.length; i++) {
      this._children[positiveZIndex[i]]._draw();
    }
  }
}

export default SceneObject;
