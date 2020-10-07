import SceneObject from "./SceneObject";
import Vector2 from "./Vector2";

class RoomGridObject extends SceneObject {
  constructor({
    scene,
    position,
    size,
    opacity,
    lineColor,
    lineWidth,
    canvasLayer,
  }) {
    super({
      scene: scene,
      position: position,
      size: size,
      scale: new Vector2(1, 1),
      staticObject: true,
      canvasLayer: canvasLayer,
    });

    this.floorColor = "#fff";
    this.borderColor = "#555";
    this.borderWidth = 0.08;

    this.lineColor = lineColor ?? "#888";
    this.lineWidth = lineWidth ?? 0.3;
    this.opacity = opacity ?? 1.0;
  }

  _update() {}

  _draw(ctx) {
    // Draw grid (each cell represents 1 sq ft)
    const numLinesX = Math.floor(this.size.x);
    const numLinesY = Math.floor(this.size.y);
    // Offsets to make sure grid is centered
    const startX = this.position.x + (this.size.x - numLinesX) / 2;
    const startY = this.position.y + (this.size.y - numLinesY) / 2;

    ctx.fillStyle = this.floorColor;
    ctx.fillRect(0, 0, this.size.x, this.size.y);

    ctx.globalAlpha = this.opacity;

    ctx.strokeStyle = this.lineColor;
    ctx.lineWidth = this.lineWidth;
    ctx.lineCap = "round";
    for (let i = 0; i < numLinesX + 1; i++) {
      ctx.beginPath();
      const currX = startX + i;
      ctx.moveTo(currX, this.position.y);
      ctx.lineTo(currX, this.position.y + this.size.y);
      ctx.stroke();
    }
    for (let i = 0; i < numLinesY + 1; i++) {
      ctx.beginPath();
      const currY = startY + i;
      ctx.moveTo(this.position.x, currY);
      ctx.lineTo(this.position.x + this.size.x, currY);
      ctx.stroke();
    }

    ctx.globalAlpha = 1.0;
  }
}

export default RoomGridObject;
