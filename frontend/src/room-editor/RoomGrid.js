import SceneObject from "./SceneObject";
import Vector2 from "./Vector2";

class RoomGrid extends SceneObject {
  constructor({
    scene,
    parent,
    position,
    size,
    opacity,
    lineColor,
    lineWidth,
  }) {
    super({
      scene: scene,
      parent: parent,
      position: position,
      size: size,
      scale: new Vector2(1, 1),
      staticObject: true,
    });

    this.borderColor = "#555";
    this.borderWidth = 0.08;

    this.lineColor = lineColor ?? "#888";
    this.lineWidth = lineWidth ?? 0.3;
    this.opacity = opacity ?? 1.0;
  }

  update() {}

  draw() {
    const ctx = this.scene.ctx;
    // Set context transform to this objects transformation matrix
    ctx.setTransform(this.transformMatrix);

    // Draw grid (each cell represents 1 sq ft)
    const numLinesX = Math.floor(this.size.x);
    const numLinesY = Math.floor(this.size.y);
    // Offsets to make sure grid is centered
    const startX = this.position.x + (this.size.x - numLinesX) / 2;
    const startY = this.position.y + (this.size.y - numLinesY) / 2;

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

    // Draw border
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = this.borderWidth;
    ctx.lineJoin = "round";
    ctx.beginPath();

    // Offset it by half the borderWidth so that the line doesn't overlap into the room itself
    ctx.moveTo(-this.borderWidth / 2, -this.borderWidth / 2);
    ctx.lineTo(this.size.x + this.borderWidth / 2, -this.borderWidth / 2);
    ctx.lineTo(
      this.size.x + this.borderWidth / 2,
      this.size.y + this.borderWidth / 2
    );
    ctx.lineTo(-this.borderWidth / 2, this.size.y + this.borderWidth / 2);
    ctx.lineTo(-this.borderWidth / 2, -this.borderWidth / 2);
    ctx.stroke();

    // Reset transformation matrix so it doesn't interfere with other draws
    ctx.resetTransform();
  }
}

export default RoomGrid;
