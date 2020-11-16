import SceneObject from "./SceneObject";
import Vector2 from "./Vector2";
import Collisions from "./Collisions";

class RoomRectObject extends SceneObject {
  constructor({
    scene,
    id,
    position,
    rotation,
    size,
    color,
    opacity,
    nameText,
    staticObject,
    snapPosition,
    snapOffset,
    canvasLayer,
    movementLocked,
  }) {
    super({
      scene: scene,
      id: id,
      position: position,
      rotation: rotation,
      size: size,
      staticObject: staticObject,
      canvasLayer: canvasLayer,
      origin: new Vector2(0.5, 0.5),
    });

    this.color = color;
    this.textColor = "#222";
    this.selectionColor = "#444";
    this.opacity = opacity ?? 1.0;

    this.nameText = nameText;

    this.outOfBounds = false;
    this.outOfBoundsColor = "#ff0000";

    this.selected = false;
    this._selectionLineSpeed = 0.4;
    this._selectionLineWidth = 0.05;
    this._selectionLineDash = [0.18, 0.15]; // [Line dash length, space length]

    this.movementLocked = movementLocked ?? false;

    this._selectionOutlineOffset = 0;

    this.snapPosition = snapPosition ?? false;
    this.snapOffset = snapOffset ?? 0.1;
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

  _update() {
    // Animates the dashed selection outline
    this._animateSelection();

    if (this.parent) {
      // Restrict position to parent borders
      const xLimit = Math.min(this.parent.size.x, Math.max(0, this.position.x));
      const yLimit = Math.min(this.parent.size.y, Math.max(0, this.position.y));

      if (
        !Vector2.floatEquals(xLimit, this.position.x) ||
        !Vector2.floatEquals(yLimit, this.position.y)
      ) {
        this.position = new Vector2(xLimit, yLimit);
      }

      // Check for collisions. Currently only checks if object collides with one of the room boundary edges.
      const offset = 0.015; // Small "error" allows for things such as a 1' x 1' obj fitting in a 1' x 1' space without counting as collision
      let bbox = this.getLocalBoundingBox();
      bbox.p1.x += offset;
      bbox.p1.y += offset;
      bbox.p2.x -= offset;
      bbox.p2.y -= offset;
      this.outOfBounds = false;
      if (this.parent._offsetPoints) {
        for (let i = 0; i < this.parent._offsetPoints.length - 1; i++) {
          const v1 = this.parent._offsetPoints[i];
          const v2 = this.parent._offsetPoints[i + 1];
          console.log(v1, v2, i);
          if (Collisions.segmentIntersectsRect(v1, v2, bbox.p1, bbox.p2)) {
            this.outOfBounds = true;
          }
        }
      }
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

  _draw(ctx) {
    ctx.fillStyle = this.outOfBounds ? this.outOfBoundsColor : this.color;
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
    const globalPos = this.localToGlobalPoint(this.position);

    const fontSize = 0.28;
    this._setContextTextStyle(ctx, fontSize);
    const lineOffset = 0.18 * this.parent.scale.x;
    const fitNameText = this._getEditedText(ctx, this.nameText);
    const fitDimensionsText = this._getEditedText(
      ctx,
      `${this.size.x}' x ${this.size.y}'`
    );
    ctx.font = `bold ${fontSize * this.parent.scale.x}px sans-serif`;

    ctx.fillText(fitNameText, globalPos.x, globalPos.y - lineOffset);

    ctx.fillText(fitDimensionsText, globalPos.x, globalPos.y + lineOffset);
  }

  // Takes font size and configures the context to draw text with these styles
  _setContextTextStyle(ctx, fontSize) {
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = this.textColor;
  }

  // Trims text so it fits in size of object. If the available width is less than the width of '...', returns empty string
  _getEditedText(ctx, text) {
    this._setContextTextStyle(ctx);
    const bbox = this.getLocalBoundingBox(); // Accounts for rotation
    const size = { x: bbox.p2.x - bbox.p1.x, y: bbox.p2.y - bbox.p1.y };
    const textPadding = size.x / 20;
    text = text.trim();
    while (ctx.measureText(text).width > size.x - 2 * textPadding) {
      if (text.length <= 3) return "";
      text = text.substring(0, text.length - 4) + "...";
    }
    return text;
  }
}

export default RoomRectObject;
