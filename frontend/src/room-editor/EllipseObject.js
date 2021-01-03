import SceneObject from "./SceneObject";

class EllipseObject extends SceneObject {
  constructor(props) {
    super({
      ...props,
    });

    const { color, opacity } = props;

    this.color = color;
    this.opacity = opacity ?? 1.0;
  }

  update() {}

  draw(ctx) {
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size.x, this.size.y, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1.0; // Reset opacity
  }
}

export default EllipseObject;
