import Point from "./Point";
import MouseController from "./MouseController"
import RoomRectObject from "./RoomRectObject"
import RoomFloorObject from "./RoomFloorObject"
import Collisions from "./Collisions";

class SceneController {
  constructor(canvas) {
    this.canvas = canvas;
    this.resizeCanvas(canvas)
    this.ctx = canvas.getContext("2d");

    this.mouseController = new MouseController({
      watchedElement: this.canvas,
      onMouseDown: this.onMouseDown.bind(this),
      onMouseMove: this.onMouseMove.bind(this),
      onMouseUp: this.onMouseUp.bind(this),
    });

    this.canvasBackgroundColor = "#f0f0f0";

    this.state = {
      objects: [],
      selectedObject: undefined,
    };

    this._lastFrameTime = undefined;
    this.deltaTime = undefined;
    this.resized = false;

    this.init();
  }

  init() {
    this._testSetup();

    //this._lastFrameTime = performance.now();
    this.mainLoop();
  }

  _testSetup() {
    const boundaryPoints = [
      new Point(0, 0),
      new Point(10, 0),
      new Point(10, 10),
      new Point(0, 10),
      new Point(0, 0),
    ];
    const floor = new RoomFloorObject({
      scene: this,
      id: 0,
      floorColor: "#ddd",
      gridLineColor: "#aaa",
      opacity: 1.0,
      boundaryPoints: boundaryPoints,
      boundaryOffset: 50,
    });
    this.state.objects.push(floor);

    const cube = new RoomRectObject ({
      scene: this,
      id: 1,
      position: new Point(0, 0),
      roomFloor: floor,
      dimensions: {
        w: 5,
        h: 6
      },
      color: "#ff0000",
      opacity: 0.5,
      text: "This is a name",
    });
    cube.position = { x: this.canvas.width/2 - cube.width/2, y: this.canvas.height/2 - cube.height/2 };
    //cube.selected = true;
    this.state.objects.push(cube);
  }

  findClickedObject(position) {
    const objects = this.state.objects;
    for (let i = 0; i < objects.length; i++) {
      if (!Object.prototype.hasOwnProperty.call(objects[i], "selected"))
        continue;
      const bbox = objects[i].getBoundingBox();
      if (Collisions.pointInRect(position, bbox)) {
        this.state.selectedObject = objects[i];
        objects[i].selected = true;
      }
    }
  }

  onMouseDown(position) {
    //console.log("MOUSE DOWN", position);
    if (this.state.selectedObject) {
      this.state.selectedObject.selected = false;
      this.state.selectedObject = undefined;
    }
    this.findClickedObject(position);
  }

  onMouseMove(delta) {
    // console.log("MOUSE MOVED", delta);
    if (this.state.selectedObject && !this.state.selectedObject.staticObject) {
      const selectedObject = this.state.selectedObject;
      selectedObject.position.x += delta.x;
      selectedObject.position.y += delta.y;
    }
  }

  onMouseUp() {
    // console.log("MOUSE UP");
  }

  mainLoop(currentTime) {
    requestAnimationFrame(this.mainLoop.bind(this));

    // Calculate time since last frame. Measured in seconds
    if (!currentTime) currentTime = performance.now(); // Needed because currentTime is undefined on first frame
    if (!this._lastFrameTime) this._lastFrameTime = currentTime;
    this.deltaTime = Math.max(0, (currentTime - this._lastFrameTime) / 1000);
    this._lastFrameTime = currentTime;
    // console.log(this.deltaTime, currentTime, this._lastFrameTime);

    this.update();
    this.render();
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