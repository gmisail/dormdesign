import SceneObject from "./SceneObject";

class RoomGridObject extends SceneObject {
  constructor(props) {
    super({
      ...props,
      staticObject: true,
    });

    const { opacity, lineColor, lineWidth, backgroundColor, cellSize } = props;

    this.backgroundColor = backgroundColor ?? "#fff";

    this.lineColor = lineColor ?? "#888";
    this.lineWidth = lineWidth ?? 0.3;
    this.cellSize = cellSize ?? 1;
    this.opacity = opacity ?? 1.0;
  }

  update() {}

  draw(ctx) {
    // Draw grid (each cell represents 1 sq ft)
    const numLinesX = Math.floor(this.size.x / this.cellSize);
    const numLinesY = Math.floor(this.size.y / this.cellSize);

    // Offsets to make sure grid is centered
    const startX = (this.size.x - numLinesX * this.cellSize) / 2;
    const startY = (this.size.y - numLinesY * this.cellSize) / 2;

    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, this.size.x, this.size.y);

    ctx.globalAlpha = this.opacity;

    ctx.strokeStyle = this.lineColor;
    ctx.lineWidth = this.lineWidth;
    ctx.lineCap = "round";
    for (let i = 0; i < numLinesX + 1; i++) {
      ctx.beginPath();
      const currX = startX + i * this.cellSize;
      ctx.moveTo(currX, 0);
      ctx.lineTo(currX, 0 + this.size.y);
      ctx.stroke();
    }
    for (let i = 0; i < numLinesY + 1; i++) {
      ctx.beginPath();
      const currY = startY + i * this.cellSize;
      ctx.moveTo(0, currY);
      ctx.lineTo(0 + this.size.x, currY);
      ctx.stroke();
    }

    ctx.globalAlpha = 1.0;
  }
}

export default RoomGridObject;
