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
    canvasLayer,
    staticObject,
  }) {
    this.scene = scene;
    this.id = id ?? scene.idCounter++;
    this._position = position ?? new Vector2(0, 0);
    this._scale = scale ?? new Vector2(1, 1);
    this._rotation = rotation ?? 0.0;
    this._origin = origin ?? new Vector2(0, 0);
    this.staticObject = staticObject ?? false;
    this.parent = null;
    this._children = [];
    this._size = size;
    this.canvasLayer = canvasLayer ?? 0;
    if (canvasLayer === 0) {
      this.scene._updateBackground = true;
    }
    this._updateTransform();
  }

  _calculateLocalTransform() {
    const matrix = new DOMMatrix([1, 0, 0, 1, 0, 0]);
    matrix.translateSelf(this._position.x, this._position.y);
    matrix.rotateSelf(0, 0, this._rotation);
    matrix.scaleSelf(this._scale.x, this._scale.y);
    matrix.translateSelf(
      -this._origin.x * this._size.x,
      -this._origin.y * this._size.y
    );
    return matrix;
  }

  // Calculates and returns the transformation matrix for this object using the parent's transformation matrix (if it has a parent. Otherwise uses identity).
  _calculateTransform() {
    let matrix;
    if (this.parent) {
      // Make a copy of parent matrix
      matrix = this.parent._transformMatrix.multiply(
        this._localTransformMatrix
      );
    } else {
      // If no parent, just return copy of local matrix
      matrix = new DOMMatrix(this._localTransformMatrix);
    }
    return matrix;
  }

  // Updates the transformation matrix for this object and its children.
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

  rotateBy(degs) {
    this.rotation = this._rotation + degs;
  }

  addChild(obj) {
    this.scene.addObject(obj);
    this._children.push(obj);
    obj.parent = this;
    obj._updateTransform();
  }

  removeChild(object) {
    object.parent = null;
    let end = 0;
    for (let i = 0; i < this._children.length; i++) {
      const obj = this._children[i];
      // Only keep objects that either dont have an id properity (i.e. aren't RoomRectObjects) or don't have an id matching the one passed in
      if (obj.id !== object.id) {
        this._children[end++] = obj;
      }
    }
    this._children.length = end;
  }

  getLocalBoundingBox() {
    // Use local transform matrix
    const matrix = this._localTransformMatrix;

    // Multiply the 4 corners of the rect by the matrix
    const c1 = new DOMPoint(0, 0).matrixTransform(matrix);
    const c2 = new DOMPoint(this._size.x, 0).matrixTransform(matrix);
    const c3 = new DOMPoint(this._size.x, this._size.y).matrixTransform(matrix);
    const c4 = new DOMPoint(0, this._size.y).matrixTransform(matrix);
    return {
      p1: new Vector2(
        Math.min(c1.x, c2.x, c3.x, c4.x),
        Math.min(c1.y, c2.y, c3.y, c4.y)
      ),
      p2: new Vector2(
        Math.max(c1.x, c2.x, c3.x, c4.x),
        Math.max(c1.y, c2.y, c3.y, c4.y)
      ),
    };
  }

  // Returns 2 points that specifcy the corners of a rect containing this object (in global coordinate system)
  getGlobalBoundingBox() {
    // Use global transformMatrix
    let matrix = this._transformMatrix;

    // Multiply the 4 corners of the obj by the matrix
    const c1 = new DOMPoint(0, 0).matrixTransform(matrix);
    const c2 = new DOMPoint(this._size.x, 0).matrixTransform(matrix);
    const c3 = new DOMPoint(this._size.x, this._size.y).matrixTransform(matrix);
    const c4 = new DOMPoint(0, this._size.y).matrixTransform(matrix);
    return {
      p1: new Vector2(
        Math.min(c1.x, c2.x, c3.x, c4.x),
        Math.min(c1.y, c2.y, c3.y, c4.y)
      ),
      p2: new Vector2(
        Math.max(c1.x, c2.x, c3.x, c4.x),
        Math.max(c1.y, c2.y, c3.y, c4.y)
      ),
    };
  }

  localToGlobalPoint(point) {
    if (!this.parent) {
      return point;
    }
    // Multiply point by parent's transform matrix
    const matrix = this.parent._transformMatrix;
    const globalPoint = new DOMPoint(point.x, point.y).matrixTransform(matrix);
    return new Vector2(globalPoint.x, globalPoint.y);
  }

  globalToLocalPoint(point) {
    if (!this.parent) {
      return point;
    }
    // Multiply point by inverse of parent's transform matrix
    const matrix = this.parent._transformMatrix.inverse();
    const localPoint = new DOMPoint(point.x, point.y).matrixTransform(matrix);
    return new Vector2(localPoint.x, localPoint.y);
  }

  update() {
    // Only update if not on background layer or background needs to be redrawn
    if (this.canvasLayer > 0 || this.scene._updateBackground) {
      this._update();
    }
  }

  draw() {
    const ctx = this.scene.ctx[this.canvasLayer];
    // Only draw if not on background layer or background needs to be redrawn
    if (this.canvasLayer > 0 || this.scene._updateBackground) {
      // Set context transform to this objects transformation matrix
      ctx.setTransform(this._transformMatrix);

      this._draw(ctx);
    }

    // Reset transformation matrix so it doesn't interfere with other draws
    ctx.resetTransform();
  }
}

export default SceneObject;
