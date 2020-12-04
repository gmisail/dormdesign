import SceneObject from "./SceneObject";

class SceneController {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.resizeCanvas(canvas);

    this.idCounter = 0;
    this.backgroundColor = "#fff";

    // Stores all currently added SceneObjects keyed by their id
    this._objects = new Map();

    // Object that will be the root parent of all other objects
    this._rootObject = new SceneObject({ scene: this });

    this._lastFrameTime = undefined;
    // Time since last frame
    this.deltaTime = undefined;
    // Set to true when if canvas has been resized this frame
    this.resized = false;
    // Callback that is called when canvas has been resized
    this.onResize = () => {};

    this.init();
  }

  init() {
    this.mainLoop(); // Start main update/render loop
  }

  mainLoop(currentTime) {
    requestAnimationFrame(this.mainLoop.bind(this));

    this.resized = this.resizeCanvas(this.canvas);
    if (this.resized) {
      this.onResize();
    }

    // Calculate time since last frame. Measured in seconds
    if (!currentTime) currentTime = performance.now(); // Needed because currentTime is undefined on first frame
    if (!this._lastFrameTime) this._lastFrameTime = currentTime;
    const deltaMilliSeconds = Math.max(0, currentTime - this._lastFrameTime);
    this.deltaTime = deltaMilliSeconds / 1000; // Convert to seconds
    this._lastFrameTime = currentTime;

    this._rootObject._update();

    // Clear canvas
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this._rootObject._draw();
  }

  addChild(obj) {
    this._rootObject.addChild(obj);
  }

  removeChild(obj) {
    this._rootObject.removeChild(obj);
  }

  // Adds object to map keyed by object ID
  _addObject(obj) {
    if (this._objects.has(obj.id)) {
      throw new Error(
        "Unable to add object to scene. Object with matching ID already added"
      );
    }
    this._objects.set(obj.id, obj);
  }

  // Removes object and all its children from map keyed by object ID
  _removeObject(obj) {
    if (!this._objects.has(obj.id)) {
      throw new Error(
        `Unable to remove object form scene. No object matching ID ${obj.id} found.`
      );
    }
    this._objects.delete(obj.id);
    this._recursivelyRemoveChildren(obj);
  }

  _recursivelyRemoveChildren(obj) {
    for (let i = 0; i < obj._children.length; i++) {
      const child = obj._children[i];
      this.removeObject(child);
      child._recursivelyRemoveChildren();
    }
  }

  hasObjectWithID(id) {
    return this._objects.has(id);
  }

  getObjectByID(id) {
    return this._objects.get(id);
  }

  resizeCanvas(canvas) {
    const realToCSSPixels = window.devicePixelRatio;

    // Lookup the size the browser is displaying the canvas in CSS pixels
    // and compute a size needed to make our drawingbuffer match it in
    // device pixels.
    var displayWidth = Math.floor(canvas.clientWidth * realToCSSPixels);
    var displayHeight = Math.floor(canvas.clientHeight * realToCSSPixels);

    // Check if the canvas is not the same size.
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      // Make the canvas the same size
      canvas.width = displayWidth;
      canvas.height = displayHeight;

      return true;
    }
    return false;
  }
}

export default SceneController;
