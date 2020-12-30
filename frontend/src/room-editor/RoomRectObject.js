import SceneObject from "./SceneObject";
import Vector2 from "./Vector2";

class RoomRectObject extends SceneObject {
  constructor(props) {
    super({
      ...props,
      origin: new Vector2(0.5, 0.5),
    });

    const {
      color,
      opacity,
      nameText,
      snapPosition,
      snapOffset,
      movementLocked,
      fontFamily,
      textColor,
    } = props;

    this.color = color;
    this.textColor = textColor ?? "#222";
    this.opacity = opacity ?? 1.0;

    this.nameText = nameText;
    this.fontFamily = fontFamily;

    this.outOfBounds = false;
    this.outOfBoundsColor = "#ff0000";

    this.selected = false;
    this._selectionColorBackground = "#333";
    this._selectionColorForeground = "#ccc";
    this._selectionLineSpeed = 0.5;
    this._selectionLineWidth = 0.105;
    this._selectionLineDash = [0.25, 0.22]; // [Line dash length, space length]

    this.movementLocked = movementLocked ?? false;

    this._selectionOutlineOffset = 0;

    this.snapPosition = snapPosition ?? false;
    this.snapOffset = snapOffset ?? 0.1;
    this._unsnappedPosition = undefined;

    this.setPosition(this.position);
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
    // Animates the dashed selection outline
    this._animateSelection();
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

  draw(ctx) {
    ctx.fillStyle = this.outOfBounds ? this.outOfBoundsColor : this.color;
    ctx.globalAlpha = this.opacity;
    ctx.fillRect(0, 0, this.size.x, this.size.y);
    ctx.globalAlpha = 1.0; // Reset opacity

    // Draw dotted selection outline
    if (this.selected) {
      ctx.strokeStyle = this._selectionColorBackground;
      ctx.setLineDash(this._selectionLineDash);
      ctx.lineDashOffset = -this._selectionOutlineOffset;
      ctx.lineWidth = this._selectionLineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeRect(0, 0, this.size.x, this.size.y);

      ctx.strokeStyle = this._selectionColorForeground;
      ctx.setLineDash(this._selectionLineDash);
      ctx.lineDashOffset = -this._selectionOutlineOffset;
      ctx.lineWidth = this._selectionLineWidth * 0.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeRect(0, 0, this.size.x, this.size.y);

      // Rest ctx values
      ctx.setLineDash([]);
    }

    // Reset transformation matrix so it doesn't interfere with other draws
    ctx.resetTransform();

    // Draw text on top of object - For some reason the context using the transformation matrix seems to draw the text differently on firefox and chrome resulting in it being offset. So its being drawn by manually scaling the necessary values.
    const globalPos = this.parent.localToGlobalPoint(this.position);

    const fontSize = 0.325;
    this._setContextTextStyle(ctx, fontSize);
    const lineOffset = 0.2 * this.parent.scale.x * this.scale.x;
    const fitNameText = this._getEditedText(ctx, this.nameText);
    const fitDimensionsText = this._getEditedText(
      ctx,
      `${this.size.x}' x ${this.size.y}'`
    );
    ctx.font = `700 ${fontSize * this.parent.scale.x * this.scale.x}px ${
      this.fontFamily
    }, sans-serif`;

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
