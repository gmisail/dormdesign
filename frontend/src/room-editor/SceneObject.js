import Point from './Point'

class SceneObject {
  constructor(scene, id, position, width, height, staticObject) {
    this.scene = scene;
    this.id = id;
    this.position = position;
    this.width = width;
    this.height = height;
    this.staticObject = staticObject;
  }

  getBoundingBox() {
    return {
      p1: new Point(this.position.x, this.position.y),
      p2: new Point(
        this.position.x + this.width,
        this.position.y + this.height
      ),
    };
  }
}

export default SceneObject;