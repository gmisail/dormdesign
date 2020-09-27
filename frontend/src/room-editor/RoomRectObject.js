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
    this._selectionLineWidth = 0.035 * window.devicePixelRatio;
    this._selectionLineDash = [
      0.06 * window.devicePixelRatio,
      0.08 * window.devicePixelRatio,
    ];

    this._selectionOutlineOffset = 0;
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
    const speed = 0.01;
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

    // Draw text on top of object
    this._setContextTextStyle();
    const lineOffset = 0.15;
    const fitNameText = this._getEditedText(this.nameText);
    ctx.fillText(fitNameText, this.size.x / 2, this.size.y / 2 - lineOffset);
    const fitDimensionsText = this._getEditedText(
      `${this.size.x}' x ${this.size.y}'`
    );
    ctx.fillText(
      fitDimensionsText,
      this.size.x / 2,
      this.size.y / 2 + lineOffset
    );

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
  }

  // Configures the context to draw text with these styles
  _setContextTextStyle() {
    const fontSize = 0.3;

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
