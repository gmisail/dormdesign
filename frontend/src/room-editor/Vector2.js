class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  static floatEquals(a, b) {
    return Math.abs(a - b) < 0.001;
  }

  // Returns vector u projected onto vector v
  static project(u, v) {
    const vMag = v.magnitude();
    const dot = this.dotProduct(u, v);
    const s = dot / (vMag * vMag);
    return new Vector2(v.x * s, v.y * s);
  }

  static dotProduct(u, v) {
    return u.x * v.x + u.y * v.y;
  }

  // Returns vector u normalized
  static normalized(u) {
    const m = u.magnitude();
    if (m === 0) return new Vector2(0, 0);
    return new Vector2(u.x / m, u.y / m);
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}

export default Vector2;
