import Vector2 from "./Vector2";

class SceneObject {
  constructor({
    scene,
    parent,
    position,
    size,
    scale,
    canvasLayer,
    staticObject,
  }) {
    this.scene = scene;
    this.id = scene.idCounter++;
    this._position = position ?? new Vector2(0, 0);
    this._scale = scale ?? new Vector2(1, 1);
    this.staticObject = staticObject ?? false;
    this.parent = parent;
    this.children = [];
    this._size = size;
    this.canvasLayer = canvasLayer ?? 0;
    if (canvasLayer === 0) {
      this.scene._updateBackground = true;
    }
    this._updateTransform();
  }

  // Calculates and returns the transformation matrix for this object using the parent's transformation matrix (if it has a parent. Otherwise uses identity).
  _calculateTransform() {
    let parentTransform = undefined;
    if (this.parent) {
      // Make a copy of parent matrix
      parentTransform = DOMMatrix.fromMatrix(this.parent.transformMatrix);
    } else {
      parentTransform = new DOMMatrix([1, 0, 0, 1, 0, 0]);
    }
    let transform = new DOMMatrix([
      this.scale.x,
      0,
      0,
      this.scale.y,
      this.position.x,
      this.position.y,
    ]);
    return parentTransform.multiplySelf(transform);
  }

  // Updates the transformation matrix for this object and its children.
  _updateTransform() {
    this._transformMatrix = this._calculateTransform();
    for (let i = 0; i < this.children.length; i++) {
      this.children[i]._updateTransform();
    }
  }

  // Getters / Setters for SceneObjects. Note that for any of these values, you can't set individual properties. i.e. don't do position.x = 2; position.y = 3. Instead do position = new Vector2(2, 3);
  get transformMatrix() {
    return this._transformMatrix;
  }
  get position() {
    return this._position;
  }
  get scale() {
    return this._scale;
  }
  get size() {
    return this._size;
  }

  set position(vector) {
    this._position = vector;
    this._updateTransform();
  }
  set scale(vector) {
    this._scale = vector;
    this._updateTransform();
  }
  set size(vector) {
    this._size = vector;
  }

  // Returns 2 points that specifcy the corners a rect containing this object (in global coordinate system)
  getGlobalBoundingBox() {
    const globalPosition = this.getGlobalPosition();
    const globalSize = this.getGlobalSize();
    return {
      p1: new Vector2(globalPosition.x, globalPosition.y),
      p2: new Vector2(
        globalPosition.x + globalSize.x,
        globalPosition.y + globalSize.y
      ),
    };
  }

  getGlobalPosition() {
    const transform = this._transformMatrix;
    return new Vector2(transform.e, transform.f);
  }

  getGlobalSize() {
    return new Vector2(
      this.size.x * this._transformMatrix.a,
      this.size.y * this._transformMatrix.d
    );
  }

  // Translates a global position into this objects local coordinate system (hasn't been test much)
  globalToLocalPosition(position) {
    let parentGlobalPos = new Vector2(0, 0);
    if (this.parent) {
      parentGlobalPos = this.parent.getGlobalPosition();
    }
    const offset = new Vector2(
      position.x - parentGlobalPos.x,
      position.y - parentGlobalPos.y
    );
    const scaled = new Vector2(
      offset.x / this.transformMatrix.a,
      offset.y / this.transformMatrix.d
    );
    return scaled;
  }

  update() {
    // Only update if not on background layer or background needs to be redrawn
    if (this.canvasLayer > 0 || this.scene._updateBackground) {
      this._update();
    }

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].update();
    }
  }

  draw() {
    const ctx = this.scene.ctx[this.canvasLayer];
    // Only draw if not on background layer or background needs to be redrawn
    if (this.canvasLayer > 0 || this.scene._updateBackground) {
      if (this.scene._updateBackground) {
        console.log("update background");
      }

      // Set context transform to this objects transformation matrix
      ctx.setTransform(this.transformMatrix);

      this._draw(ctx);
    }
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].draw();
    }

    // Reset transformation matrix so it doesn't interfere with other draws
    ctx.resetTransform();
  }
}

export default SceneObject;
