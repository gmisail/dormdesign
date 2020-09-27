
class SceneController {
  constructor(canvas) {
    this.canvas = canvas;
    this.resizeCanvas(canvas)
    this.ctx = canvas.getContext("2d");

    this.idCounter = 0;

    this.canvasBackgroundColor = "#f0f0f0";

    this.state = {
      objects: [],
    };

    const targetFps = 60;
    this._fpsInterval = 1000 / targetFps;
    this._lastFrameTime = undefined;
    this.deltaTime = undefined; // Time since last frame

    this.resized = false; // Set to true when if canvas has been resized this frame

    this.init();
  }

  init() {
    this.mainLoop();  // Start main update/render loop
  }

  getAllChildObjects(object) {
    // console.log(object);
    let children = [];
    for (let i = 0; i < object.children.length; i++) {
      children.push(object.children[i]);
      children = children.concat(this._recursiveGetAllObjects(object.children[i]));
    }
    // console.log(children);
    return children;
  }

  mainLoop(currentTime) {
    requestAnimationFrame(this.mainLoop.bind(this));

    // Calculate time since last frame. Measured in seconds
    if (!currentTime) currentTime = performance.now(); // Needed because currentTime is undefined on first frame
    if (!this._lastFrameTime) this._lastFrameTime = currentTime;
    const deltaMilliSeconds = Math.max(0, (currentTime - this._lastFrameTime));
    this.deltaTime = deltaMilliSeconds / 1000; // Convert to seconds
    

    // Limit fps to desired rate
    if (deltaMilliSeconds > this._fpsInterval) {
      
      this.update();
      this.render();
      this._lastFrameTime = currentTime;
    }
  }

  addObject(obj) {
    this.state.objects.push(obj)
  }

  update() {
    const objects = this.state.objects;
    for (let i = 0; i < objects.length; i++) {
      objects[i].update();
    }
  }

  render() {
    // Resize canvas if screen size has changed
    this.resized = this.resizeCanvas(this.canvas);

    // Clear canvas
    this.ctx.fillStyle = this.canvasBackgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const objects = this.state.objects;
    for (let i = 0; i < objects.length; i++) {
      objects[i].draw();
    }
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
      canvas.height = displayWidth; //displayHeight;
      // Return true if canvas was reszied
      return true;
    }
    return false;
  }
}

export default SceneController;