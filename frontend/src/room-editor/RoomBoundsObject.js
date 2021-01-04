import SceneObject from "./SceneObject";
import Vector2 from "./Vector2";
import MouseController from "./MouseController";
import Collisions from "./Collisions";

class RoomBoundsObject extends SceneObject {
  constructor(props) {
    super(props);

    const { points, color, edgeWidth, editingColor, onPointSelected } = props;

    this.color = color ?? "#555";
    this.edgeWidth = edgeWidth ?? 0.07;
    this._pointSize = this.edgeWidth * 3;
    this._pointSelectionSize = this._pointSize * 1.65;

    this._editing = false;
    this.editingColor = editingColor ?? "#2b7cff";
    this._newPointPreview = null;
    this._hoverPointIndex = null;

    this._points = [];
    this._offsetPoints = [];
    this.points = points;

    this.onPointSelected = onPointSelected ?? (() => {});
    this.selectedPointIndex = null;

    this.mouseController = new MouseController({
      watchedElement: this.scene.canvas,
      onMouseDown: this.onMouseDown.bind(this),
    });
  }

  set editing(value) {
    this._editing = value;
    this.selectedPointIndex = null;
  }

  get editing() {
    return this._editing;
  }

  /* Whenever "points" property is set or retrieved, set/return copies instead of references */
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
    const copied = [];
    for (let i = 0; i < this._points.length; i++) {
      copied.push(new Vector2(this._points[i].x, this._points[i].y));
    }
    return copied;
  }

  setPointAtIndex(index, value) {
    this._points[index] = new Vector2(value.x, value.y);
    this._calculateOffsetPoints();
  }

  getPointAtIndex(index) {
    return new Vector2(this._points[index].x, this._points[index].y);
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

  onMouseDown(position) {
    if (!this.editing) return;
    const localMousePos = this.globalToLocalPoint(position);
    for (let i = 0; i < this._offsetPoints.length; i++) {
      const size = this._pointSelectionSize;
      const rect = this._getPointRect(this._offsetPoints[i], size);
      if (Collisions.pointInRect(localMousePos, rect)) {
        this.selectedPointIndex = i;
        // Don't return actual reference, so use the getPointAtIndex function which returns a copy
        this.onPointSelected(this.getPointAtIndex(i));
        return;
      }
    }
    const newPoint = this._getNewPointLocation(localMousePos);
    if (newPoint !== null) {
      console.log(newPoint);
      const newPoints = [];
      let inserted = false;
      for (let i = 0; i < this._points.length; i++) {
        if (i === newPoint[1] && !inserted) {
          newPoints.push(newPoint[0]);
          inserted = true;
          i--;
        } else {
          newPoints.push(this._points[i]);
        }
      }
      this.points = newPoints;
      return;
    }
    if (this.selectedPointIndex !== null) {
      this.selectedPointIndex = null;
      this.onPointSelected(null);
    }
  }

  _getPointRect(point, size) {
    return {
      p1: new Vector2(point.x - size / 2, point.y - size / 2),
      p2: new Vector2(point.x + size / 2, point.y + size / 2),
    };
  }

  // Find new point location by checking edges mouse is closest to and projecting the mouse position onto the edge
  _getNewPointLocation(mousePos) {
    if (mousePos === null) return null;
    // Maximum distance cursor can be from an edge to count
    const cutoff = 0.3;
    // Distance from new point to mouse position
    let minDistance = null;
    // Position of new point
    let minProjected = null;
    // Index where new point would be
    let minIndex = null;
    for (let i = 0; i < this._offsetPoints.length - 1; i++) {
      const p1 = this._offsetPoints[i];
      const p2 = this._offsetPoints[i + 1];
      // Vector from p1 to p2
      const a = new Vector2(p2.x - p1.x, p2.y - p1.y);
      // Vector from p1 to mouse position
      const b = new Vector2(mousePos.x - p1.x, mousePos.y - p1.y);
      // Don't allow points that go "behind" edge
      if (Vector2.dotProduct(a, b) < 0) continue;

      const c = Vector2.project(b, a);
      // Dont allow points that go past end of edge
      if (c.magnitude() > a.magnitude()) continue;

      const dist = new Vector2(c.x - b.x, c.y - b.y).magnitude();
      if (dist <= cutoff && (minDistance === null || dist < minDistance)) {
        minDistance = dist;
        minIndex = i + 1;
        minProjected = new Vector2(p1.x + c.x, p1.y + c.y);
      }
    }
    if (minProjected === null) return null;
    return [minProjected, minIndex];
  }

  update() {
    if (this.editing) {
      const localMousePos =
        this.mouseController.position === null
          ? null
          : this.globalToLocalPoint(this.mouseController.position);
      this._newPointPreview = null;

      if (localMousePos !== null) {
        let hovering = false;
        for (let i = 0; i < this._offsetPoints.length; i++) {
          const size =
            i === this._hoverPointIndex
              ? this._pointSelectionSize
              : this._pointSelectionSize;
          const rect = this._getPointRect(this._offsetPoints[i], size);
          if (Collisions.pointInRect(localMousePos, rect)) {
            this._hoverPointIndex = i;
            hovering = true;
            break;
          }
        }
        if (!hovering) {
          this._hoverPointIndex = null;
        }
      }

      // Only look for new point preview if no point is currently selected or being hovered over
      if (this.selectedPointIndex === null && this._hoverPointIndex === null) {
        const newPoint = this._getNewPointLocation(localMousePos);
        if (newPoint !== null) {
          this._newPointPreview = newPoint[0];
        }
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

      if (this.editing) {
        const size =
          i === this.selectedPointIndex || i === this._hoverPointIndex
            ? this._pointSelectionSize
            : this._pointSize;
        const rect = this._getPointRect(this._offsetPoints[i], size);
        ctx.fillStyle = this.editingColor;
        ctx.fillRect(
          rect.p1.x,
          rect.p1.y,
          rect.p2.x - rect.p1.x,
          rect.p2.y - rect.p1.y
        );
      }
    }
    ctx.closePath();
    ctx.strokeStyle = this.editing ? this.editingColor : this.color;
    ctx.lineWidth = this.edgeWidth;
    ctx.lineJoin = "butt";
    ctx.lineCap = "butt";
    ctx.stroke();

    if (this.editing && this._newPointPreview !== null) {
      const rect = this._getPointRect(
        this._newPointPreview,
        this._pointSelectionSize
      );
      ctx.globalAlpha = 0.6;
      ctx.fillRect(
        rect.p1.x,
        rect.p1.y,
        rect.p2.x - rect.p1.x,
        rect.p2.y - rect.p1.y
      );
    }
  }
}

export default RoomBoundsObject;
