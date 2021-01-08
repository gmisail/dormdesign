import SceneObject from "./SceneObject";

class RectObject extends SceneObject {
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
    ctx.fillRect(0, 0, this.size.x, this.size.y);
    ctx.globalAlpha = 1.0; // Reset opacity
  }
}

export default RectObject;
