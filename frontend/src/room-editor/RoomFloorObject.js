import Point from "./Point"
import SceneObject from "./SceneObject"

class RoomFloorObject extends SceneObject {
  constructor({
    scene,
    id,
    floorColor,
    gridLineColor,
    opacity,
    boundaryPoints,
    boundaryOffset,
  }) {
    super(scene, id, new Point(0, 0), 0, 0, true);

    // Points that define room boundary (measured in feet)
    this.boundaryPoints = boundaryPoints;
    // Padding from edge of canvas for room outline
    this.boundaryOffset = boundaryOffset * window.devicePixelRatio;

    this._fitFloorToCanvas();

    this.floorColor = floorColor;
    this.textColor = "#222";
    this.borderColor = "#555";
    this.gridLineColor = gridLineColor;
    this.opacity = opacity ?? 1.0;
  }

  _fitFloorToCanvas() {
    // Find canvas pixels per foot
    let maxWidth;
    let maxHeight;
    for (let i = 0; i < this.boundaryPoints.length; i++) {
      if (!maxWidth || this.boundaryPoints[i].x > maxWidth) {
        maxWidth = this.boundaryPoints[i].x;
      }
      if (!maxHeight || this.boundaryPoints[i].y > maxHeight) {
        maxHeight = this.boundaryPoints[i].y;
      }
    }
    const usableCanvasWidth =
      this.scene.canvas.width - 2 * this.boundaryOffset;
    const usableCanvasHeight =
      this.scene.canvas.height - 2 * this.boundaryOffset;

    let roomAspect = maxWidth / maxHeight;
    let canvasAspect =
      this.scene.canvas.width / this.scene.canvas.height;

    // Compare canvas aspect ratio to room aspect ratio in to make sure room will fit in canvas
    if (roomAspect > canvasAspect) {
      this.pixelsPerFoot = usableCanvasWidth / maxWidth;
    } else {
      this.pixelsPerFoot = usableCanvasHeight / maxHeight;
    }
    this.width = maxWidth * this.pixelsPerFoot;
    this.height = maxHeight * this.pixelsPerFoot;
    this.position = new Point(
      this.scene.canvas.width / 2 - this.width / 2,
      this.scene.canvas.height / 2 - this.height / 2
    );

    this.borderWidth = Math.min(2, Math.max(0.5, this.pixelsPerFoot / 20)) * window.devicePixelRatio;
    this.gridLineWidth = Math.min(1, Math.max(0.25, this.pixelsPerFoot / 10)) * window.devicePixelRatio;
  }

  update() {
    // Resize if the canvas has been resized
    if (this.scene.resized) {
      this._fitFloorToCanvas();
    }
  }

  draw() {
    const ctx = this.scene.ctx;
    const bbox = this.getBoundingBox();
    ctx.fillStyle = this.floorColor;
    ctx.globalAlpha = this.opacity;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    ctx.globalAlpha = 1.0; // Reset opacity

    // Draw grid (each cell represents 1 sq ft)
    const feetWidth = this.width / this.pixelsPerFoot;
    const feetHeight = this.height / this.pixelsPerFoot;
    const numLinesX = Math.floor(feetWidth);
    const numLinesY = Math.floor(feetHeight);
    const startX =
      this.position.x + ((feetWidth - numLinesX) / 2) * this.pixelsPerFoot;
    const startY =
      this.position.y + ((feetHeight - numLinesY) / 2) * this.pixelsPerFoot;

    ctx.strokeStyle = this.gridLineColor;
    ctx.lineWidth = this.gridLineWidth;
    ctx.lineCap = "round";
    for (let i = 0; i < numLinesX + 1; i++) {
      ctx.beginPath();
      const currX = startX + i * this.pixelsPerFoot;
      ctx.moveTo(currX, bbox.p1.y);
      ctx.lineTo(currX, bbox.p2.y);
      ctx.stroke();
    }
    for (let i = 0; i < numLinesY + 1; i++) {
      ctx.beginPath();
      const currY = startY + i * this.pixelsPerFoot;
      ctx.moveTo(bbox.p1.x, currY);
      ctx.lineTo(bbox.p2.x, currY);
      ctx.stroke();
    }

    // Draw border
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = this.borderWidth;
    ctx.lineJoin = "round";
    ctx.beginPath();

    ctx.moveTo(bbox.p1.x, bbox.p1.y);
    ctx.lineTo(bbox.p2.x, bbox.p1.y);
    ctx.lineTo(bbox.p2.x, bbox.p2.y);
    ctx.lineTo(bbox.p1.x, bbox.p2.y);
    ctx.lineTo(bbox.p1.x, bbox.p1.y);
    ctx.stroke();

    // Draw caption text
    const captionText = "1 cell = 1 square foot";
    this._setContextTextStyle();
    const textWidth = ctx.measureText(captionText).width;
    if (textWidth < this.width) {
      ctx.fillText(
        captionText,
        bbox.p1.x + this.width / 2,
        bbox.p1.y + this.height + (15 * window.devicePixelRatio)
      );
    }
  }

  _setContextTextStyle() {
    const fontSize = Math.min(this.scene.ctx.canvas.width/40, 13 * devicePixelRatio);
    this.scene.ctx.font = `bold ${fontSize}px sans-serif`;
    this.scene.ctx.textBaseline = "middle";
    this.scene.ctx.textAlign = "center";
    this.scene.ctx.fillStyle = this.textColor;
  }
}

export default RoomFloorObject;