const { createCanvas } = require("canvas");

let PreviewRenderer = {};

/**
 * SIZE sets the pixel resolution of the output image
 *
 * Since the output is always a square, a value of SIZE = 100
 * would result in a 100px by 100px image.
 */
PreviewRenderer.SIZE = 300;

/**
 * PADDING (in percent of total image size) around the rendered room.
 *
 * Example: If the PADDING = 0.25 and SIZE = 100(px) then there will be 25px of padding on each side (left, right, top, bottom)
 *
 * PADDING will NOT affect the final pixel output size of the image (specified by PreviewRenderer.SIZE), only the size of the room itself in the final render
 */
PreviewRenderer.PADDING = 0.12;
// Padding must be strictly less than 0.5
PreviewRenderer.PADDING = Math.min(0.49, PreviewRenderer.PADDING);

/**
 * Specifies the maximum number of grid cells to draw (per dimension). It's important that this value is set to something
 * reasonably low because for a very large room, if the grid were drawn to scale, it would probably both look bad and take
 * signifantly more time/computing power to draw (since drawing the grid has a runtime of at least O(N^2) where N is the number of grid cells per dimension)
 *
 * So a value of 25 for example means that at most a grid of size 25 x 25 cells will be drawn
 */
PreviewRenderer.MAX_DRAWN_CELLS = 25;

/**
 * Find the bounding box that contains all of the points
 * @param { array<{ x: Number, y: Number }>} points
 * @returns { w, h, x, y }
 */
PreviewRenderer.getBoundingBox = function (points, items) {
  if (points === undefined || points.length == 0) return { w: 0, h: 0, x: 0, y: 0 };

  let min = { x: Infinity, y: Infinity };
  let max = { x: -Infinity, y: -Infinity };

  for (let i in points) {
    const point = points[i];

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
};

/**
 * Draws a grid of square cells across the entire bbox
 * @param {*} bbox
 */
PreviewRenderer.drawGrid = function (bbox) {
  // Each grid cell should be 1ft^2
  const preferredCellSize = 1;
  /*
    Set maximum number of allowed cells (per each dimension not total) to avoid too many lines being drawn (ugly and computationally expensive).
    
    Note the drawback is the grid for large rooms will not represent 1ft^2.
  */
  // Calculate actual cell size taking into account preferred and max
  const cellSize = Math.max(
    preferredCellSize,
    bbox.w / PreviewRenderer.MAX_DRAWN_CELLS,
    bbox.h / PreviewRenderer.MAX_DRAWN_CELLS
  );

  const numLinesX = Math.floor(bbox.w / cellSize);
  const numLinesY = Math.floor(bbox.h / cellSize);

  // Offsets to make sure grid is centered
  const startX = (bbox.w - numLinesX * cellSize) / 2;
  const startY = (bbox.h - numLinesY * cellSize) / 2;

  PreviewRenderer.ctx.strokeStyle = "#777";
  PreviewRenderer.ctx.lineWidth = 0.5;
  PreviewRenderer.ctx.lineCap = "round";
  for (let i = 0; i < numLinesX + 1; i++) {
    PreviewRenderer.ctx.beginPath();
    const currX = startX + i * cellSize;
    PreviewRenderer.ctx.moveTo(currX * PreviewRenderer.SCALE, 0);
    PreviewRenderer.ctx.lineTo(currX * PreviewRenderer.SCALE, 0 + bbox.w * PreviewRenderer.SCALE);
    PreviewRenderer.ctx.stroke();
  }
  for (let i = 0; i < numLinesY + 1; i++) {
    PreviewRenderer.ctx.beginPath();
    const currY = startY + i * cellSize;
    PreviewRenderer.ctx.moveTo(0, currY * PreviewRenderer.SCALE);
    PreviewRenderer.ctx.lineTo(0 + bbox.h * PreviewRenderer.SCALE, currY * PreviewRenderer.SCALE);
    PreviewRenderer.ctx.stroke();
  }
};

/**
 * Draw boundaries to canvas
 * @param {*} points
 * @param {*} boundingBox
 */
PreviewRenderer.drawBoundaries = function (points, boundingBox) {
  PreviewRenderer.ctx.beginPath();

  let xOffset = 0;
  if (boundingBox.x != 0) xOffset = boundingBox.x * -1;

  let yOffset = 0;
  if (boundingBox.y != 0) yOffset = boundingBox.y * -1;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    if (i === 0) {
      PreviewRenderer.ctx.moveTo(
        (xOffset + p1.x) * PreviewRenderer.SCALE,
        (yOffset + p1.y) * PreviewRenderer.SCALE
      );
    }
    PreviewRenderer.ctx.lineTo(
      (xOffset + p2.x) * PreviewRenderer.SCALE,
      (yOffset + p2.y) * PreviewRenderer.SCALE
    );
  }

  PreviewRenderer.ctx.closePath();
  PreviewRenderer.ctx.strokeStyle = "#111";
  PreviewRenderer.ctx.lineWidth = 3;
  PreviewRenderer.ctx.lineJoin = "butt";
  PreviewRenderer.ctx.lineCap = "butt";

  PreviewRenderer.ctx.stroke();
};

/**
 *
 * @param { array } items
 * @param { w, h, x, y } boundingBox
 */
PreviewRenderer.drawItems = function (items, boundingBox) {
  // borrowed from frontend
  const objectColors = ["#0043E0", "#f28a00", "#C400E0", "#7EE016", "#0BE07B"];
  PreviewRenderer.ctx.globalAlpha = 0.6;

  let xOffset = 0;
  if (boundingBox.x != 0) xOffset = boundingBox.x * -1;

  let yOffset = 0;
  if (boundingBox.y != 0) yOffset = boundingBox.y * -1;

  for (let i in items) {
    const item = items[i];

    if (item.visibleInEditor) {
      const width =
        item.dimensions === undefined || item.dimensions.width == null ? 1 : item.dimensions.width;
      const length =
        item.dimensions === undefined || item.dimensions.length == null
          ? 1
          : item.dimensions.length;

      PreviewRenderer.ctx.fillStyle = objectColors[i % objectColors.length];

      const x = item.editorPosition.x;
      const y = item.editorPosition.y;

      PreviewRenderer.ctx.save();
      PreviewRenderer.ctx.translate(
        (x + xOffset) * PreviewRenderer.SCALE,
        (y + yOffset) * PreviewRenderer.SCALE
      );
      if (item.editorRotation !== undefined && item.editorRotation !== 0) {
        PreviewRenderer.ctx.rotate((item.editorRotation * Math.PI) / 180);
      }
      PreviewRenderer.ctx.fillRect(
        (-width / 2) * PreviewRenderer.SCALE,
        (-length / 2) * PreviewRenderer.SCALE,
        width * PreviewRenderer.SCALE,
        length * PreviewRenderer.SCALE
      );
      PreviewRenderer.ctx.restore();
    }
  }

  // Reset global alpha
  PreviewRenderer.ctx.globalAlpha = 1.0;
};

/**
 * Generate a preview of the provided room data
 * @param { { vertices: [{x: Number, y: Number}], items: [] } } roomData
 */
PreviewRenderer.generatePreview = function (roomData) {
  let { vertices, items } = roomData;

  let boundaryBox = PreviewRenderer.getBoundingBox(vertices);

  // Adjust the bbox to incorporate padding, which is calculated as a percentage of the total bbox size (including the padding itself)
  const actualPadding =
    (PreviewRenderer.PADDING * boundaryBox.w) / (1 - 2 * PreviewRenderer.PADDING);
  boundaryBox.x -= actualPadding;
  boundaryBox.y -= actualPadding;
  boundaryBox.w += actualPadding * 2;
  boundaryBox.h += actualPadding * 2;

  PreviewRenderer.SCALE = PreviewRenderer.SIZE / boundaryBox.w;

  PreviewRenderer.canvas.width = boundaryBox.w * PreviewRenderer.SCALE;
  PreviewRenderer.canvas.height = boundaryBox.h * PreviewRenderer.SCALE;

  PreviewRenderer.ctx.fillStyle = "#fff";
  PreviewRenderer.ctx.fillRect(
    0,
    0,
    boundaryBox.w * PreviewRenderer.SCALE,
    boundaryBox.h * PreviewRenderer.SCALE
  );

  PreviewRenderer.drawGrid(boundaryBox);
  PreviewRenderer.drawBoundaries(vertices, boundaryBox);
  PreviewRenderer.drawItems(items, boundaryBox);

  return PreviewRenderer.canvas.toDataURL();
};

/* 
    Set up one instance of canvas that be used for rendering the previews. Re-using
    one canvas instance is better than creating them over and over again.
*/
PreviewRenderer.canvas = createCanvas(200, 200);
PreviewRenderer.ctx = PreviewRenderer.canvas.getContext("2d");

module.exports = PreviewRenderer;
