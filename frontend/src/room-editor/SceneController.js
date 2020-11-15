class SceneController {
  constructor(canvases) {
    this.canvasArray = canvases;
    this.resizeCanvases(canvases);

    this.ctx = [];
    for (let i = 0; i < canvases.length; i++) {
      this.ctx.push(canvases[i].getContext("2d"));
    }

    this.idCounter = 0;
    this.backgroundColor = "#fff";

    this.objects = new Map();

    this._lastFrameTime = undefined;
    this.deltaTime = undefined; // Time since last frame

    this.resized = false; // Set to true when if canvas has been resized this frame
    this._updateBackground = true;

    this.init();
  }

  init() {
    this.mainLoop(); // Start main update/render loop
  }

  mainLoop(currentTime) {
    requestAnimationFrame(this.mainLoop.bind(this));

    // Resize canvas if screen size has changed
    this.resized = this.resizeCanvases(this.canvasArray);
    if (this.resized) {
      this._updateBackground = true;
    }

    // Calculate time since last frame. Measured in seconds
    if (!currentTime) currentTime = performance.now(); // Needed because currentTime is undefined on first frame
    if (!this._lastFrameTime) this._lastFrameTime = currentTime;
    const deltaMilliSeconds = Math.max(0, currentTime - this._lastFrameTime);
    this.deltaTime = deltaMilliSeconds / 1000; // Convert to seconds
    this._lastFrameTime = currentTime;

    this.update();
    this.render();
  }

  addObject(obj) {
    this.objects.set(obj.id, obj);
  }

  removeObject(obj) {
    this.objects.delete(obj.id);
    for (let i = 0; i < obj.children.length; i++) {
      obj.children[i].parent = null;
    }
    obj.parent.removeChild(obj);
  }

  update() {
    for (let obj of this.objects.values()) {
      obj.update();
    }
  }

  render() {
    if (this._updateBackground) {
      this.ctx[0].fillStyle = this.backgroundColor;
      this.ctx[0].fillRect(
        0,
        0,
        this.ctx[0].canvas.width,
        this.ctx[0].canvas.height
      );
    }

    // Clear canvas
    this._clearForegroundCanvases(this.ctx);

    for (let obj of this.objects.values()) {
      obj.draw();
    }

    this._updateBackground = false;
  }

  _clearForegroundCanvases(contexts) {
    for (let i = 1; i < contexts.length; i++) {
      // contexts[i].fillStyle = this.canvasBackgroundColor;
      contexts[i].clearRect(
        0,
        0,
        contexts[i].canvas.width,
        contexts[i].canvas.height
      );
    }
  }

  resizeCanvases(canvasArray) {
    let resized = false;
    for (let i = 0; i < canvasArray.length; i++) {
      if (this.resizeCanvas(canvasArray[i])) {
        resized = true;
      }
    }
    return resized;
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
