class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  static floatEquals(a, b) {
    return Math.abs(a - b) < 0.001;
  }
}

export default Vector2;
