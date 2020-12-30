import SceneObject from "./SceneObject";
import Vector2 from "./Vector2";

class RoomBoundsObject extends SceneObject {
  constructor(props) {
    super(props);

    const { points, color, edgeWidth } = props;

    this.color = color ?? "#555";
    this.edgeWidth = edgeWidth ?? 0.07;

    this._points = [];
    this.points = points;
  }

  set points(points) {
    // Create copies of the points since we don't want to reference the passed in objects themselves
    const copied = [];
    if (points) {
      for (let i = 0; i < points.length; i++) {
        copied.push(new Vector2(points[i].x, points[i].y));
      }
    }

    this._points = copied;
    this._offsetPoints = [];

    this._calculateOffsetPoints();
  }
  get points() {
    return this._points;
  }

  // Calculates and sets offset points (used so that when drawing room border the lines won't overlap into the room)
  _calculateOffsetPoints() {
    const offset = this.edgeWidth / 2;
    this._offsetPoints = [];
    for (let i = 0; i < this._points.length; i++) {
      this._offsetPoints.push(
        new Vector2(this._points[i].x, this._points[i].y)
      );
    }
    // Add reference to first point to end of list so its properly updated by last edge
    if (this._offsetPoints.length > 0) {
      this._offsetPoints.push(this._offsetPoints[0]);
    }
    for (let i = 0; i < this._offsetPoints.length - 1; i++) {
      const p1 = this._offsetPoints[i];
      const p2 = this._offsetPoints[i + 1];

      if (Vector2.floatEquals(p1.x, p2.x)) {
        // Vertical line
        const direction = p2.y > p1.y ? 1 : -1;
        p1.x = p1.x + offset * direction;
        p2.x = p2.x + offset * direction;
      } else {
        // Horizontal line
        const direction = p2.x > p1.x ? 1 : -1;
        p1.y = p1.y - offset * direction;
        p2.y = p2.y - offset * direction;
      }
    }
  }

  draw(ctx) {
    ctx.beginPath();
    for (let i = 0; i < this._offsetPoints.length - 1; i++) {
      const p1 = this._offsetPoints[i];
      const p2 = this._offsetPoints[i + 1];

      if (i === 0) {
        ctx.moveTo(p1.x, p1.y);
      }
      ctx.lineTo(p2.x, p2.y);
    }
    ctx.closePath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.edgeWidth;
    ctx.lineJoin = "butt";
    ctx.lineCap = "butt";
    ctx.stroke();
  }
}

export default RoomBoundsObject;
