import SceneObject from "./SceneObject";
import Vector2 from "./Vector2";
import MouseController from "./MouseController";
import Collisions from "./Collisions";

class RoomBoundsObject extends SceneObject {
  constructor(props) {
    super(props);

    const { points, color, edgeWidth, editingColor, onPointSelected, onPointsUpdated } = props;

    this.color = color ?? "#555";
    this.edgeWidth = edgeWidth ?? 0.07;
    this._pointSize = this.edgeWidth * 3;
    this._pointSelectionSize = this._pointSize * 1.4;

    this._editing = false;
    this.editingColor = editingColor ?? "#2b7cff";
    this._newPointPreview = null;
    this._hoverPointIndex = null;
    this._movingPoint = false;

    this._points = [];
    this._offsetPoints = [];
    this.points = points;

    this._edgeLengths = [];
    this._edgeLengthPositions = [];
    this.edgeLengthDistance = 0.7;
    this.edgeLengths = true;
    this.edgeLengthFontSize = 0.35;

    this.onPointsUpdated = onPointsUpdated ?? (() => {});
    this.onPointSelected = onPointSelected ?? (() => {});
    this.selectedPointIndex = null;

    this.mouseController = new MouseController({
      watchedElement: this.scene.canvas,
      onMouseDown: this.onMouseDown.bind(this),
      onMouseMove: this.onMouseMove.bind(this),
      onMouseUp: this.onMouseUp.bind(this),
    });
  }

  set editing(value) {
    this._editing = value;
    this.selectedPointIndex = null;
  }

  get editing() {
    return this._editing;
  }

  get movingPoint() {
    return this._movingPoint;
  }

  get pointsLength() {
    return this._points.length;
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
    this._calculateEdgeLengths();
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

  selectPointAtIndex(index) {
    this.selectedPointIndex = index;
    // Don't pass actual reference, so use the getPointAtIndex function which returns a copy
    this.onPointSelected(index === null ? null : this.getPointAtIndex(index));
  }

  deletePointAtIndex(index) {
    if (index === null) return;

    this._points = this._points.filter((_point, id) => id !== index);
    this._offsetPoints = this._offsetPoints.filter((_offsetPoint, id) => id !== index);

    if (index === this.selectedPointIndex) {
      this.selectPointAtIndex(null);
    }
  }

  _calculateEdgeLengths() {
    this._edgeLengths = [];
    this._edgeLengthPositions = [];
    for (let i = 0; i < this._points.length; i++) {
      const p1 = this._points[i];
      const p2 = i === this._points.length - 1 ? this._points[0] : this._points[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      let length = Math.sqrt(dx * dx + dy * dy);
      // Round length to 2 decimal places
      this._edgeLengths.push(Math.round((length + Number.EPSILON) * 100) / 100);

      const norm = Vector2.normalized(new Vector2(dy, -dx));
      this._edgeLengthPositions.push(
        new Vector2(
          p1.x + dx / 2 + norm.x * this.edgeLengthDistance,
          p1.y + dy / 2 + norm.y * this.edgeLengthDistance
        )
      );
    }
  }

  // Calculates the amount of shift the points in an edge based on the given offset
  _offsetEdge(p1, p2, offset) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const norm = Vector2.normalized(new Vector2(dy, -dx));

    return new Vector2(offset * norm.x, offset * norm.y);
  }

  // Offsets the corner between two edges (used so that when drawing room border the lines won't overlap into the room)
  _calculateOffsetPoints() {
    this._offsetPoints = [];

    this._points.forEach((point) => this._offsetPoints.push(new Vector2(point.x, point.y)));

    if (this._offsetPoints.length < 3) return;
    // Add references to the first two items to the end of the array to make things easier
    this._offsetPoints.push(this._offsetPoints[0], this._offsetPoints[1]);
    const offsetAmount = this.edgeWidth / 2;
    for (let i = 0; i < this._offsetPoints.length - 2; i++) {
      const p1 = this._offsetPoints[i];
      let p2 = this._offsetPoints[i + 1];
      const p3 = this._offsetPoints[i + 2];
      // Find how much to offset the two edges
      const offset1 = this._offsetEdge(p1, p2, offsetAmount);
      const offset2 = this._offsetEdge(p2, p3, offsetAmount);
      // Find the new point where the two offset segments intersect
      const newCorner = Collisions.linesIntersect(
        new Vector2(p1.x + offset1.x, p1.y + offset1.y),
        new Vector2(p2.x + offset1.x, p2.y + offset1.y),
        new Vector2(p2.x + offset2.x, p2.y + offset2.y),
        new Vector2(p3.x + offset2.x, p3.y + offset2.y),
        false
      );

      if (newCorner !== null) {
        let cornerOffset = new Vector2(newCorner.x - p2.x, newCorner.y - p2.y);
        const maxLength = 1;
        if (cornerOffset.magnitude() > maxLength) {
          const normalized = Vector2.normalized(cornerOffset);
          cornerOffset = new Vector2(normalized.x * maxLength, normalized.y * maxLength);
        }
        p2.x += cornerOffset.x;
        p2.y += cornerOffset.y;
      } else {
        // If no intersection is found (e.g. edges are parallel or coincident) then just use the offset of the first edge
        p2.x += offset1.x;
        p2.y += offset1.y;
      }
    }
    this._offsetPoints.pop();
    this._offsetPoints.pop();
  }

  onMouseDown(position) {
    if (!this.editing) return;
    const localMousePos = this.globalToLocalPoint(position);
    // Check if point has been clicked on
    for (let i = 0; i < this._points.length; i++) {
      const size = this._pointSelectionSize;
      const rect = this._getPointRect(this._points[i], size);
      if (Collisions.pointInRect(localMousePos, rect)) {
        this._movingPoint = true;
        this.selectPointAtIndex(i);
        return;
      }
    }
    // Check if there's a valid new point that can be created from mouse position
    if (this.selectedPointIndex === null) {
      const newPoint = this._getNewPointLocation(localMousePos);
      if (newPoint !== null) {
        const newPoints = [];
        for (let i = 0; i < this._points.length; i++) {
          newPoints.push(this._points[i]);
          if (i === newPoint[1] - 1) {
            newPoints.push(newPoint[0]);
          }
        }
        this.points = newPoints;
        this.selectPointAtIndex(newPoint[1]);
        return;
      }
    }

    // Otherwise deselect any selected points
    if (this.selectedPointIndex !== null) {
      this.selectPointAtIndex(null);
    }
  }

  onMouseMove(delta) {
    if (!this.editing) return;
    // Click and drag on selected point to move it
    if (this.selectedPointIndex !== null && this._movingPoint) {
      const p = this._points[this.selectedPointIndex];
      const globalPointPos = this.localToGlobalPoint(p);
      globalPointPos.x += delta.x;
      globalPointPos.y += delta.y;
      const newPointPos = this.globalToLocalPoint(globalPointPos);
      p.x = Number(newPointPos.x.toFixed(2));
      p.y = Number(newPointPos.y.toFixed(2));
      this._calculateOffsetPoints();
      this._calculateEdgeLengths();

      this.onPointsUpdated(this.points);
    }
  }

  onMouseUp() {
    this._movingPoint = false;
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
    for (let i = 0; i < this._points.length; i++) {
      const p1 = this._points[i];
      const p2 = i === this._points.length - 1 ? this._points[0] : this._points[i + 1];
      // Vector from p1 to p2
      const a = new Vector2(p2.x - p1.x, p2.y - p1.y);
      // Vector from p1 to mouse position
      const b = new Vector2(mousePos.x - p1.x, mousePos.y - p1.y);
      // Don't allow points that go "behind" edge
      if (Vector2.dotProduct(a, b) < 0) continue;

      const c = Vector2.project(b, a);
      // Dont allow points that go past end of edge or are too close to endpoints
      const minDistanceFromEndpoints = this._pointSelectionSize * 0.75;
      if (
        c.magnitude() > a.magnitude() - minDistanceFromEndpoints ||
        c.magnitude() < minDistanceFromEndpoints
      )
        continue;

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

  // Checks whether a boundary edge is valid
  _edgeValid(p1, p2, p1Index) {
    const TEST_SEGMENT_LENGTH = 1000;
    const dx = (p2.x - p1.x) / 2;
    const dy = (p2.y - p1.y) / 2;
    const a = new Vector2(p1.x + dx, p1.y + dy);
    const b = new Vector2(a.x + -dy * TEST_SEGMENT_LENGTH, a.y + dx * TEST_SEGMENT_LENGTH);

    let valid = false;
    const prevEdgeIndex = p1Index === 0 ? this._offsetPoints.length - 1 : p1Index - 1;
    const nextEdgeIndex = p1Index === this._offsetPoints.length - 1 ? 0 : p1Index + 1;
    for (let i = 0; i < this._offsetPoints.length; i++) {
      if (i === p1Index) continue;

      const q1 = this._offsetPoints[i];
      const q2 = this._offsetPoints[i === this._offsetPoints.length - 1 ? 0 : i + 1];
      /*  
        If the edge intersects any of the other edges in the 
        boundary (except for adjacent edges which it will obviously 
        intersect since they share a point), it' invalid
      */
      if (i !== prevEdgeIndex && i !== nextEdgeIndex && Collisions.linesIntersect(p1, p2, q1, q2)) {
        return false;
      }
      /*  
        If the line perpendicular to the right side of the edge doesn't intersect
        any other edges, then the edge is invalid
      */
      if (Collisions.linesIntersect(a, b, q1, q2) !== null) valid = true;
    }
    return valid;
  }

  update() {
    if (this.editing) {
      const localMousePos =
        this.mouseController.position === null
          ? null
          : this.globalToLocalPoint(this.mouseController.position);

      this._newPointPreview = null;

      // Check if hovering over any of the points
      if (localMousePos !== null) {
        let hovering = false;
        for (let i = 0; i < this._points.length; i++) {
          const size = this._pointSelectionSize;
          const rect = this._getPointRect(this._points[i], size);
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

      // Check if there's a valid new point preview (only if no point is currently selected or being hovered over)
      if (this.selectedPointIndex === null && this._hoverPointIndex === null) {
        const newPoint = this._getNewPointLocation(localMousePos);
        if (newPoint !== null) {
          // New point position (not offset yet)
          const p = newPoint[0];
          /* If the new index will be the final point (i.e. the new point is on the last edge), use the index of the 1st point to find offset edge */
          const index = newPoint[1] === this._points.length ? 0 : newPoint[1];

          // Calculate offset position for drawing the preview
          const p1 = new Vector2(p.x, p.y);
          const p2 = new Vector2(this._points[index].x, this._points[index].y);
          const offset = this._offsetEdge(p1, p2, this.edgeWidth / 2);
          p1.x += offset.x;
          p1.y += offset.y;
          this._newPointPreview = p;
        }
      }
    }
  }

  draw(ctx) {
    // Draw edges
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
    ctx.strokeStyle = this.editing ? this.editingColor : this.color;
    ctx.lineWidth = this.edgeWidth;
    ctx.lineJoin = "butt";
    ctx.lineCap = "butt";

    if (this.editing) {
      ctx.globalAlpha = 0.6;
    }
    ctx.stroke();

    // Check if each edge is valid. If not, draw a red line over it
    if (this.editing) {
      ctx.globalAlpha = 1.0;
      for (let i = 0; i < this._offsetPoints.length; i++) {
        const p1 = this._offsetPoints[i];
        const p2 = this._offsetPoints[i === this._offsetPoints.length - 1 ? 0 : i + 1];
        const valid = this._edgeValid(p1, p2, i);

        if (!valid) {
          ctx.strokeStyle = "#ff6b6b";
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        /*
         The following code draws normal lines coming off of each edge 
         that are used to determine if the orientation is correct 
         
         (used for debugging)
        */
        // const TEST_SEGMENT_LENGTH = 1000;
        // const dx = (p2.x - p1.x) / 2;
        // const dy = (p2.y - p1.y) / 2;
        // const a = new Vector2(p1.x + dx, p1.y + dy);
        // const b = new Vector2(
        //   a.x + -dy * TEST_SEGMENT_LENGTH,
        //   a.y + dx * TEST_SEGMENT_LENGTH
        // );
        // ctx.strokeStyle = "#00ff00";
        // ctx.beginPath();
        // ctx.moveTo(a.x, a.y);
        // ctx.lineTo(b.x, b.y);
        // ctx.stroke();
      }
    }

    // Draw points
    if (this.editing) {
      for (let i = 0; i < this._points.length; i++) {
        const size =
          i === this.selectedPointIndex || i === this._hoverPointIndex
            ? this._pointSelectionSize
            : this._pointSize;
        const rect = this._getPointRect(this._points[i], size);
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = this.editingColor;
        ctx.fillRect(rect.p1.x, rect.p1.y, rect.p2.x - rect.p1.x, rect.p2.y - rect.p1.y);
      }
    }

    // Draw new point preview (if set)
    if (this.editing && this._newPointPreview !== null) {
      const rect = this._getPointRect(this._newPointPreview, this._pointSize);
      ctx.globalAlpha = 1.0;
      ctx.fillRect(rect.p1.x, rect.p1.y, rect.p2.x - rect.p1.x, rect.p2.y - rect.p1.y);
    }

    // Draw edge lengths (always draw when in edit mode)
    if (this.edgeLengths || this.editing) {
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.8;
      ctx.font = `bold ${this.edgeLengthFontSize}px sans-serif`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      for (let i = 0; i < this._edgeLengthPositions.length; i++) {
        const length = this._edgeLengths[i].toString();
        const pos = this._edgeLengthPositions[i];
        ctx.fillText(length + " ft", pos.x, pos.y);
      }
      ctx.globalAlpha = 1.0;
    }
  }
}

export default RoomBoundsObject;
