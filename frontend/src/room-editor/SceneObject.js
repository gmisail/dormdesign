import Vector2 from './Vector2'

class SceneObject {
  constructor({ scene, parent, position, size, scale, staticObject }) {
    this.scene = scene;
    this.id = scene.idCounter++;
    this.position = position ?? new Vector2(0, 0);
    this.scale = scale ?? new Vector2(1, 1);
    this.staticObject = staticObject ?? false;
    this.parent = parent;
    this.children = [];
    this.size = size;
  }

  getBoundingBox() {
    return {
      p1: undefined,
      p2: undefined,
      // p1: new Point(this.position.x, this.position.y),
      // p2: new Point(
      //   this.position.x + this.width,
      //   this.position.y + this.height
      // ),
    };
  }

  getTransform() {
    let parentTransform = undefined;
    if (this.parent) {
      parentTransform = this.parent.getTransform();
    } else {
      parentTransform = new DOMMatrix([1, 0, 0, 1, 0, 0]);
    }
    // console.log("Parent", parentTransform)
    let transform = new DOMMatrix([this.scale.x, 0, 0, this.scale.y, this.position.x, this.position.y]);
    //let transform = new DOMMatrix([3, 0, 0, 3, 4, 3]);
    // console.log("Before", transform);
    return parentTransform.multiplySelf(transform);
    // console.log("After", transform);
    // parentTransform = parentTransform.scaleSelf(scale.x, scale.y);
    // parentTransform = parentTransform.

  }

  getWidth() {
    return this.size.x * this.scale.x;
  }

  getHeight() {
    return this.size.y * this.scale.y;
  }

  update() {
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].update();
    }
  }

  draw() {
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].draw();
    }
  }
}

export default SceneObject;