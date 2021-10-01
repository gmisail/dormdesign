import Vector2 from "./Vector2";

class Collisions {
  static pointInRect(point, bbox) {
    return (
      point.x >= bbox.p1.x && point.x <= bbox.p2.x && point.y >= bbox.p1.y && point.y <= bbox.p2.y
    );
  }

  // AABB collision
  static rectInRect(p1, p2, q1, q2) {
    return (
      p1.x < q1.x + (q2.x - q1.x) &&
      p1.x + (p2.x - p1.x) > q1.x &&
      p1.y < q1.y + (q2.y - q1.y) &&
      p1.y + (p2.y - p1.y) > q1.y
    );
  }

  // Checks what side of a line segment the point (x, y) is on. 0 is on the line, 1 is below and 2 is above
  static pointOrientation(x1, y1, x2, y2, x, y) {
    const val = (y2 - y1) * x + (x1 - x2) * y + (x2 * y1 - x1 * y2);
    if (val === 0) return val;
    return val > 0 ? 2 : 1;
  }

  // Detects intersection between a line segment and a Rect. p and q are the segment's points. a and b are the corners of the rect
  static segmentIntersectsRect(p, q, a, b) {
    const orientations = [
      this.pointOrientation(p.x, p.y, q.x, q.y, a.x, a.y),
      this.pointOrientation(p.x, p.y, q.x, q.y, a.x, b.y),
      this.pointOrientation(p.x, p.y, q.x, q.y, b.x, b.y),
      this.pointOrientation(p.x, p.y, q.x, q.y, b.x, a.y),
    ];
    let possible = false;
    for (let i = 0; i < 4; i++) {
      if (i !== 3 && orientations[i] !== orientations[i + 1]) {
        // If they are all 1 or all 2, no intersection
        possible = true;
        break;
      }
    }
    if (!possible) return false;

    // Project segment endpoints onto x axis and y axis and check if shadow intersects shadow of rect
    if (p.x > b.x && q.x > b.x) return false; // Line is to the right
    if (p.x < a.x && q.x < a.x) return false; // Line is to the left
    if (p.y > b.y && q.y > b.y) return false; // Line is above
    if (p.y < a.y && q.y < a.y) return false; // Line is below

    return true;
  }

  /*
   line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/

   If the 'segments' parameter is false the function will find the intersection between the infinite lines the segments lie on
  */
  static linesIntersect(p1, p2, q1, q2, segments) {
    // Check if none of the lines are of length 0
    if ((p1.x === p2.x && p1.y === p2.y) || (q1.x === q2.x && q1.y === q2.y)) {
      return null;
    }

    const denominator = (q2.y - q1.y) * (p2.x - p1.x) - (q2.x - q1.x) * (p2.y - p1.y);

    // Lines are parallel
    if (denominator === 0) {
      return null;
    }

    let ua = ((q2.x - q1.x) * (p1.y - q1.y) - (q2.y - q1.y) * (p1.x - q1.x)) / denominator;
    let ub = ((p2.x - p1.x) * (p1.y - q1.y) - (p2.y - p1.y) * (p1.x - q1.x)) / denominator;

    // is the intersection along the segments
    if (segments !== false && (ua < 0 || ua > 1 || ub < 0 || ub > 1)) {
      return null;
    }

    // Return a object with the x and y coordinates of the intersection
    let x = p1.x + ua * (p2.x - p1.x);
    let y = p1.y + ua * (p2.y - p1.y);

    return new Vector2(x, y);
  }
}

export default Collisions;
