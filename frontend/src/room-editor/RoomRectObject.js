import SceneObject from "./SceneObject"

class RoomRectObject extends SceneObject {
  constructor({
    scene,
    parent,
    position,
    size,
    color,
    opacity,
    nameText,
    staticObject,
  }) {
    super({ 
      scene: scene, 
      parent: parent,
      position: position, 
      size: size, 
      staticObject: staticObject, 
    });

    this.color = color;
    this.textColor = "#222";
    this.selectionColor = "#555";
    this.opacity = opacity ?? 1.0;

    // Get draw width and height using room's pixels per foot
    // this._calculateSize();

    this.nameText = nameText;

    this.selected = false;
    // [Line dash length, space length]
    this._selectionLineWidth = 2 * window.devicePixelRatio;
    this._selectionLineDash = [6 * window.devicePixelRatio, 8 * window.devicePixelRatio]; 
    this._selectionOutlineOffset = 0;

  }

  update() {
    this._animateSelection();
    if (this.scene.resized) {
      this._calculateSize();
    }
    
    // // Restrict to room borders
    // const floorBbox = this.roomFloor.getBoundingBox();
    // this.position.x = Math.min(floorBbox.p2.x - this.width, Math.max(floorBbox.p1.x, this.position.x));
    // this.position.y = Math.min(floorBbox.p2.y - this.height, Math.max(floorBbox.p1.y, this.position.y));
  }

  _animateSelection() {
    const speed = 30 * this.scene.deltaTime;
    this._selectionOutlineOffset += speed;
    if (
      this._selectionOutlineOffset >
      this._selectionLineDash[0] + this._selectionLineDash[1]
    ) {
      this._selectionOutlineOffset = 0;
    }
  }

  draw() {
    const ctx = this.scene.ctx;
    ctx.setTransform(this.getTransform());
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.fillRect(0, 0, this.size.x, this.size.y);
    ctx.globalAlpha = 1.0; // Reset opacity

    ctx.resetTransform();

    // // Draw text on top of object
    // this._setContextTextStyle();
    // const bbox = this.getBoundingBox();
    // const lineOffset = Math.max(0.15 * this.roomFloor.pixelsPerFoot, 5 * window.devicePixelRatio);
    // const fitNameText = this._getEditedText(this.nameText);
    // ctx.fillText(
    //   fitNameText,
    //   bbox.p1.x + this.width / 2,
    //   bbox.p1.y + this.height / 2 - lineOffset
    // );
    // const fitDimensionsText = this._getEditedText(`${this.dimensions.w}' x ${this.dimensions.h}'`);
    // ctx.fillText(
    //   fitDimensionsText,
    //   bbox.p1.x + this.width / 2,
    //   bbox.p1.y + this.height / 2 + lineOffset
    // );

    // Draw dotted selection outline
    if (this.selected) {
      ctx.strokeStyle = this.selectionColor;
      ctx.setLineDash(this._selectionLineDash);
      ctx.lineDashOffset = -this._selectionOutlineOffset;
      ctx.lineWidth = this._selectionLineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeRect(0, 0, this.size.x, this.size.y);

      // Rest ctx values
      ctx.setLineDash([]);
    }
  }

  _setContextTextStyle() {
    // Font size range
    const fontSize = Math.min(13 * window.devicePixelRatio, Math.max(this.roomFloor.pixelsPerFoot * 0.25, 8 * window.devicePixelRatio));

    this.scene.ctx.font = `bold ${fontSize}px sans-serif`;
    this.scene.ctx.textBaseline = "middle";
    this.scene.ctx.textAlign = "center";
    this.scene.ctx.fillStyle = this.textColor;
  }

  // Trims text so it fits in size of object. If the available width is less than the width of '...', returns empty string
  _getEditedText(text) {
    this._setContextTextStyle();
    const textPadding = 5;
    text = text.trim();
    while (
      this.scene.ctx.measureText(text).width >
      this.width - 2 * textPadding
    ) {
      if (text.length <= 3) return "";
      text = text.substring(0, text.length - 4) + "...";
    }
    return text;
  }
}

export default RoomRectObject;