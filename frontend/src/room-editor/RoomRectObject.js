import SceneObject from "./SceneObject"

class RoomRectObject extends SceneObject {
  constructor({
    scene,
    id,
    position,
    roomFloor,
    dimensions,
    color,
    opacity,
    text,
    staticObject,
  }) {
    super(scene, id, position, 0, 0, staticObject);

    this.roomFloor = roomFloor
    this.dimensions = dimensions // Dimensions measured in feet
    this.color = color;
    this.textColor = "#222";
    this.selectionColor = "#555";
    this.opacity = opacity ?? 1.0;

    // Get draw width and height using room's pixels per foot
    this._calculateSize();

    this._originalText = text;
    this._fitText = this._getEditedText(text);

    this.selected = false;
    // [Line dash length, space length]
    this._selectionLineWidth = 2 * window.devicePixelRatio;
    this._selectionLineDash = [6 * window.devicePixelRatio, 8 * window.devicePixelRatio]; 
    this._selectionOutlineOffset = 0;
  }

  get text() {
    return this._originalText;
  }
  set text(value) {
    this._fitText = this._getEditedText(value);
    this._originalText = value;
  }

  update() {
    this._animateSelection();
    if (this.scene.resized) {
      this._calculateSize();
    }
    
    // Restrict to room borders
    const floorBbox = this.roomFloor.getBoundingBox();
    this.position.x = Math.min(floorBbox.p2.x - this.width, Math.max(floorBbox.p1.x, this.position.x));
    this.position.y = Math.min(floorBbox.p2.y - this.height, Math.max(floorBbox.p1.y, this.position.y));
  }
  
  _calculateSize() {
    this.width = this.dimensions.w * this.roomFloor.pixelsPerFoot;
    this.height = this.dimensions.h * this.roomFloor.pixelsPerFoot;
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
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    ctx.globalAlpha = 1.0; // Reset opacity

    // Draw text on top of object
    if (this._fitText) {
      this._setContextTextStyle();
      const bbox = this.getBoundingBox();
      ctx.fillText(
        this._fitText,
        bbox.p1.x + this.width / 2,
        bbox.p1.y + this.height / 2
      );
    }

    // Draw dotted selection outline
    if (this.selected) {
      ctx.strokeStyle = this.selectionColor;
      ctx.setLineDash(this._selectionLineDash);
      ctx.lineDashOffset = -this._selectionOutlineOffset;
      ctx.lineWidth = this._selectionLineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);

      // Rest ctx values
      ctx.setLineDash([]);
    }
  }

  _setContextTextStyle() {
    const fontSize = Math.min(this.scene.ctx.canvas.width/40, 13 * devicePixelRatio);
    this.scene.ctx.font = `bold ${fontSize}px sans-serif`;
    this.scene.ctx.textBaseline = "middle";
    this.scene.ctx.textAlign = "center";
    this.scene.ctx.fillStyle = this.textColor;
  }

  // Trims text so it fits in size of object. If the available width is less than the width of '...', returns empty string
  // TODO (maybe) - Implement multiline text?
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