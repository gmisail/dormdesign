import SceneObject from "./SceneObject";
import Vector2 from "./Vector2";

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
    snapPosition,
    snapOffset,
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
    this.selectionColor = "#444";
    this.opacity = opacity ?? 1.0;

    this.nameText = nameText;

    this.selected = false;
    this._selectionLineSpeed = 0.4;
    this._selectionLineWidth = 0.07;
    this._selectionLineDash = [0.22, 0.18]; // [Line dash length, space length]

    this._selectionOutlineOffset = 0;

    this.snapPosition = snapPosition ?? false;
    this.snapOffset = snapOffset ?? 0.1;
    console.log(this.snapOffset);
    this._unsnappedPosition = undefined;
    this.setPosition(position);
  }

  // Set position function that handles position snapping. If snapping is disabled, just sets position normally
  setPosition(pos) {
    let x = pos.x;
    let y = pos.y;
    if (this.snapPosition) {
      this._unsnappedPosition = pos;
      x = this._roundToNearestMultipleOf(
        this._unsnappedPosition.x,
        this.snapOffset
      );
      y = this._roundToNearestMultipleOf(
        this._unsnappedPosition.y,
        this.snapOffset
      );
    }
    this.position = new Vector2(x, y);
  }

  // Returns the unsnapped position. If position snapping is disabled, returns normal position
  getUnsnappedPosition() {
    return this._unsnappedPosition ?? this.position;
  }

  // Rounds num to the nearest multiple of given a number
  _roundToNearestMultipleOf(num, multipleOf) {
    const remainder = num % multipleOf;
    const divided = num / multipleOf;
    const rounded =
      remainder >= multipleOf / 2 ? Math.ceil(divided) : Math.floor(divided);
    return multipleOf * rounded;
  }

  update() {
    this._animateSelection();

    // Restrict to parent (room) borders
    if (this.parent) {
      const xLimit = Math.min(
        this.parent.size.x - this.size.x,
        Math.max(0, this.position.x)
      );
      const yLimit = Math.min(
        this.parent.size.y - this.size.y,
        Math.max(0, this.position.y)
      );
      this.position = new Vector2(xLimit, yLimit);
    }
  }

  // Animates the selection border
  _animateSelection() {
    const speed = this._selectionLineSpeed * this.scene.deltaTime;
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
    // Set context transform to this objects transformation matrix
    ctx.setTransform(this.transformMatrix);

    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.fillRect(0, 0, this.size.x, this.size.y);
    ctx.globalAlpha = 1.0; // Reset opacity

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

    // Reset transformation matrix so it doesn't interfere with other draws
    ctx.resetTransform();

    // Draw text on top of object - For some reason the context using the transformation matrix seems to draw the text differently on firefox and chrome resulting in it being offset. So its being drawn by manually scaling the necessary values.
    const fontSize = 0.28;
    this._setContextTextStyle(fontSize);
    const lineOffset = 0.18 * this.transformMatrix.a;
    const fitNameText = this._getEditedText(this.nameText);
    const fitDimensionsText = this._getEditedText(
      `${this.size.x}' x ${this.size.y}'`
    );
    ctx.font = `bold ${fontSize * this.transformMatrix.a}px sans-serif`;
    ctx.fillText(
      fitNameText,
      this.transformMatrix.e + (this.size.x / 2) * this.transformMatrix.a,
      this.transformMatrix.f +
        (this.size.y / 2) * this.transformMatrix.a -
        lineOffset
    );

    ctx.fillText(
      fitDimensionsText,
      this.transformMatrix.e + (this.size.x / 2) * this.transformMatrix.a,
      this.transformMatrix.f +
        (this.size.y / 2) * this.transformMatrix.a +
        lineOffset
    );
  }

  // Takes font size and configures the context to draw text with these styles
  _setContextTextStyle(fontSize) {
    this.scene.ctx.font = `bold ${fontSize}px sans-serif`;
    this.scene.ctx.textBaseline = "middle";
    this.scene.ctx.textAlign = "center";
    this.scene.ctx.fillStyle = this.textColor;
  }

  // Trims text so it fits in size of object. If the available width is less than the width of '...', returns empty string
  _getEditedText(text) {
    this._setContextTextStyle();
    const textPadding = this.size.x / 20;
    text = text.trim();
    while (
      this.scene.ctx.measureText(text).width >
      this.size.x - 2 * textPadding
    ) {
      if (text.length <= 3) return "";
      text = text.substring(0, text.length - 4) + "...";
    }
    return text;
  }
}

export default RoomRectObject;
