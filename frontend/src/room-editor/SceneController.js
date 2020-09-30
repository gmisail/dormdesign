class SceneController {
  constructor(canvases) {
    this.canvasArray = canvases;
    this.resizeCanvases(canvases);

    this.ctx = [];
    for (let i = 0; i < canvases.length; i++) {
      this.ctx.push(canvases[i].getContext("2d"));
    }

    this.idCounter = 0;
    this.canvasBackgroundColor = "#f0f0f0";

    this.state = {
      objects: [],
    };

    this._lastFrameTime = undefined;
    this.deltaTime = undefined; // Time since last frame

    this.resized = false; // Set to true when if canvas has been resized this frame

    this.init();
  }

  init() {
    this.mainLoop(); // Start main update/render loop
  }

  getAllChildObjects(object) {
    // console.log(object);
    let children = [];
    for (let i = 0; i < object.children.length; i++) {
      children.push(object.children[i]);
      children = children.concat(
        this._recursiveGetAllObjects(object.children[i])
      );
    }
    // console.log(children);
    return children;
  }

  mainLoop(currentTime) {
    requestAnimationFrame(this.mainLoop.bind(this));

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
    this.state.objects.push(obj);
  }

  update() {
    const objects = this.state.objects;
    for (let i = 0; i < objects.length; i++) {
      objects[i].update();
    }
  }

  render() {
    // Resize canvas if screen size has changed
    this.resized = this.resizeCanvases(this.canvasArray);

    // Clear canvas

    this._clearCanvases(this.ctx);

    const objects = this.state.objects;
    for (let i = 0; i < objects.length; i++) {
      objects[i].draw();
    }
  }

  _clearCanvases(contexts) {
    for (let i = 0; i < contexts.length; i++) {
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
        // Set parent div to size of canvas (since canvas has position absolute)
        canvasArray[i].parentElement.style.width = `${canvasArray[i].width}px`;
        canvasArray[i].parentElement.style.height = `${canvasArray[i].width}px`;
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
    const displayWidth = Math.floor(canvas.clientWidth * realToCSSPixels);
    //var displayHeight = Math.floor(canvas.clientHeight * realToCSSPixels);

    // Check if the canvas is not the same size.
    if (canvas.width !== displayWidth || canvas.height !== displayWidth) {
      // Make the canvas the same size
      canvas.width = displayWidth;
      canvas.height = displayWidth;

      // Set parent div to size of canvas (since canvas has position absolute)
      canvas.parentElement.style.width = `${displayWidth}px`;
      canvas.parentElement.style.height = `${displayWidth}px`;

      // Return true if canvas was reszied
      return true;
    }
    return false;
  }
}

export default SceneController;
