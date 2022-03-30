const { createCanvas } = require("canvas");

class PreviewRenderer {
  constructor() {
    /**
     * SIZE sets the pixel resolution of the output image
     *
     * Since the output is always a square, a value of SIZE = 100
     * would result in a 100px by 100px image.
     */
    this.SIZE = 300;

    /**
     * PADDING (in percent of total image size) around the rendered room.
     *
     * Example: If the PADDING = 0.25 and SIZE = 100(px) then there will be 25px of padding on each side (left, right, top, bottom)
     *
     * PADDING will NOT affect the final pixel output size of the image (specified by this.SIZE), only the size of the room itself in the final render
     */
    this.PADDING = 0.12;
    this.PADDING = Math.min(0.49, this.PADDING);

    /**
     * Specifies the maximum number of grid cells to draw (per dimension). It's important that this value is set to something
     * reasonably low because for a very large room, if the grid were drawn to scale, it would probably both look bad and take
     * signifantly more time/computing power to draw (since drawing the grid has a runtime of at least O(N^2) where N is the number of grid cells per dimension)
     *
     * So a value of 25 for example means that at most a grid of size 25 x 25 cells will be drawn
     */
    this.MAX_DRAWN_CELLS = 25;

    /*
      Represents the colors of the items that are being rendered. The first item is rendered using the first color, the second item uses the second, etc...
    */
    this.ITEM_COLORS = ["#0043E0", "#f28a00", "#C400E0", "#7EE016", "#0BE07B"];

    /*
     * Set up one instance of canvas that be used for rendering the previews. Re-using
     * one canvas instance is better than creating them over and over again.
     */
    this.canvas = createCanvas(200, 200);
    this.ctx = this.canvas.getContext("2d");
  }

  /**
   * Find the bounding box that contains all of the points
   * @param { array<{ x: Number, y: Number }>} points
   * @returns { w, h, x, y }
   */
  getBoundingBox(points, items) {
    if (points === undefined || points.length == 0) return { w: 0, h: 0, x: 0, y: 0 };

    let min = { x: Infinity, y: Infinity };
    let max = { x: -Infinity, y: -Infinity };

    for (const point of points) {
      if (point.x < min.x) min.x = point.x;
      else if (point.x > max.x) max.x = point.x;

      if (point.y < min.y) min.y = point.y;
      else if (point.y > max.y) max.y = point.y;
    }

    /* TODO (maybe?): We also might want to consider item positions when calculating the bbox. */

    const bbox = {
      w: max.x - min.x,
      h: max.y - min.y,
      x: min.x,
      y: min.y,
    };

    /* If the bbox isn't a square, we will stretch the smaller dimension to make it one */
    if (bbox.w < bbox.h) {
      const diff = bbox.h - bbox.w;
      // Stretch and re-center smaller dimension
      bbox.w += diff;
      bbox.x -= diff / 2;
    } else if (bbox.h < bbox.w) {
      const diff = bbox.w - bbox.h;
      // Stretch and re-center smaller dimension
      bbox.h += diff;
      bbox.y -= diff / 2;
    }

    return bbox;
  }

  /**
   * Draws a grid of square cells across the entire bbox
   * @param {*} bbox
   */
  drawGrid(bbox) {
    const preferredCellSize = 1;
    /*
      Set maximum number of allowed cells (per each dimension not total) to avoid too many lines being drawn (ugly and computationally expensive).
      
      Note the drawback is the grid for large rooms will not represent 1ft^2.
    */
    // Calculate actual cell size taking into account preferred and max
    const cellSize = Math.max(
      preferredCellSize,
      bbox.w / this.MAX_DRAWN_CELLS,
      bbox.h / this.MAX_DRAWN_CELLS
    );

    const numLinesX = Math.floor(bbox.w / cellSize);
    const numLinesY = Math.floor(bbox.h / cellSize);

    // Offsets to make sure grid is centered
    const startX = (bbox.w - numLinesX * cellSize) / 2;
    const startY = (bbox.h - numLinesY * cellSize) / 2;

    this.ctx.strokeStyle = "#777";
    this.ctx.lineWidth = 0.5;
    this.ctx.lineCap = "round";
    for (let i = 0; i < numLinesX + 1; i++) {
      this.ctx.beginPath();
      const currX = startX + i * cellSize;
      this.ctx.moveTo(currX * this.SCALE, 0);
      this.ctx.lineTo(currX * this.SCALE, 0 + bbox.w * this.SCALE);
      this.ctx.stroke();
    }
    for (let i = 0; i < numLinesY + 1; i++) {
      this.ctx.beginPath();
      const currY = startY + i * cellSize;
      this.ctx.moveTo(0, currY * this.SCALE);
      this.ctx.lineTo(0 + bbox.h * this.SCALE, currY * this.SCALE);
      this.ctx.stroke();
    }
  }

  /**
   * Draw boundaries to canvas
   * @param {*} points
   * @param {*} boundingBox
   */
  drawBoundaries(points, boundingBox) {
    this.ctx.beginPath();

    let xOffset = 0;
    if (boundingBox.x != 0) xOffset = boundingBox.x * -1;

    let yOffset = 0;
    if (boundingBox.y != 0) yOffset = boundingBox.y * -1;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      if (i === 0) {
        this.ctx.moveTo((xOffset + p1.x) * this.SCALE, (yOffset + p1.y) * this.SCALE);
      }
      this.ctx.lineTo((xOffset + p2.x) * this.SCALE, (yOffset + p2.y) * this.SCALE);
    }

    this.ctx.closePath();
    this.ctx.strokeStyle = "#111";
    this.ctx.lineWidth = 3;
    this.ctx.lineJoin = "butt";
    this.ctx.lineCap = "butt";

    this.ctx.stroke();
  }

  /**
   *
   * @param { array } items
   * @param { w, h, x, y } boundingBox
   */
  drawItems(items, boundingBox) {
    // borrowed from frontend
    this.ctx.globalAlpha = 0.6;

    let xOffset = 0;
    if (boundingBox.x != 0) xOffset = boundingBox.x * -1;

    let yOffset = 0;
    if (boundingBox.y != 0) yOffset = boundingBox.y * -1;

    for (let i in items) {
      const item = items[i];

      if (item.visibleInEditor) {
        const width =
          item.dimensions === undefined || item.dimensions.width == null
            ? 1
            : item.dimensions.width;
        const length =
          item.dimensions === undefined || item.dimensions.length == null
            ? 1
            : item.dimensions.length;

        this.ctx.fillStyle = this.ITEM_COLORS[i % this.ITEM_COLORS.length];

        const x = item.editorPosition.x;
        const y = item.editorPosition.y;

        this.ctx.save();
        this.ctx.translate((x + xOffset) * this.SCALE, (y + yOffset) * this.SCALE);
        if (item.editorRotation !== undefined && item.editorRotation !== 0) {
          this.ctx.rotate((item.editorRotation * Math.PI) / 180);
        }
        this.ctx.fillRect(
          (-width / 2) * this.SCALE,
          (-length / 2) * this.SCALE,
          width * this.SCALE,
          length * this.SCALE
        );
        this.ctx.restore();
      }
    }

    // Reset global alpha
    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Generate a preview of the provided room data
   * @param { { vertices: [{x: Number, y: Number}], items: [] } } roomData
   */
  generatePreview(roomData) {
    let { vertices, items } = roomData;

    let boundaryBox = this.getBoundingBox(vertices);

    // Adjust the bbox to incorporate padding, which is calculated as a percentage of the total bbox size (including the padding itself)
    const actualPadding = (this.PADDING * boundaryBox.w) / (1 - 2 * this.PADDING);
    boundaryBox.x -= actualPadding;
    boundaryBox.y -= actualPadding;
    boundaryBox.w += actualPadding * 2;
    boundaryBox.h += actualPadding * 2;

    this.SCALE = this.SIZE / boundaryBox.w;

    this.canvas.width = boundaryBox.w * this.SCALE;
    this.canvas.height = boundaryBox.h * this.SCALE;

    this.ctx.fillStyle = "#fff";
    this.ctx.fillRect(0, 0, boundaryBox.w * this.SCALE, boundaryBox.h * this.SCALE);

    this.drawGrid(boundaryBox);
    this.drawBoundaries(vertices, boundaryBox);
    this.drawItems(items, boundaryBox);

    return this.canvas.toDataURL();
  }
}

module.exports = new PreviewRenderer();
