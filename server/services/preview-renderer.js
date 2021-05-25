const { createCanvas } = require("canvas");

let PreviewRenderer = {};

/*
    SCALE indicates how much we want to enlarge the final render, since by default they're pretty small. Keep
    in mind that since these are raster renders, the higher the scale the higher the resolution. I think a 
    SVG renderer for this would be a little overkill in my opinion.
*/
PreviewRenderer.SCALE = 25;

/**
 * Find the bounding box that contains all of the points
 * @param { array<{ x: Number, y: Number }>} points
 * @returns { w, h, x, y }
 */
PreviewRenderer.getBoundingBox = function (points) {
  if (points === undefined || points.length == 0)
    return { w: 0, h: 0, x: 0, y: 0 };

  let min = { x: 0, y: 0 };
  let max = { x: 0, y: 0 };

  for (let i in points) {
    const point = points[i];

    if (point.x < min.x) min.x = point.x;
    else if (point.x > max.x) max.x = point.x;

    if (point.y < min.y) min.y = point.y;
    else if (point.y > max.y) max.y = point.y;
  }

  return {
    w: max.x - min.x,
    h: max.y - min.y,
    x: min.x,
    y: min.y,
  };
};

/**
 * Draw boundaries to canvas
 * @param {*} points
 * @param {*} boundingBox
 */
PreviewRenderer.drawBoundaries = function (points, boundingBox) {
  PreviewRenderer.context.beginPath();

  let xOffset = 0;
  if (boundingBox.x != 0) xOffset = boundingBox.x * -1;

  let yOffset = 0;
  if (boundingBox.y != 0) yOffset = boundingBox.y * -1;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    if (i === 0) {
      PreviewRenderer.context.moveTo(
        (xOffset + p1.x) * PreviewRenderer.SCALE,
        (yOffset + p1.y) * PreviewRenderer.SCALE
      );
    }
    PreviewRenderer.context.lineTo(
      (xOffset + p2.x) * PreviewRenderer.SCALE,
      (yOffset + p2.y) * PreviewRenderer.SCALE
    );
  }

  PreviewRenderer.context.closePath();
  PreviewRenderer.context.strokeStyle = "black";
  PreviewRenderer.context.lineWidth = 3;
  PreviewRenderer.context.lineJoin = "butt";
  PreviewRenderer.context.lineCap = "butt";

  PreviewRenderer.context.stroke();
};


/**
 *
 * @param { array } items
 * @param { w, h, x, y } boundingBox
 */
PreviewRenderer.drawItems = function (items, boundingBox) {
  // borrowed from frontend
  const objectColors = ["#0043E0", "#f28a00", "#C400E0", "#7EE016", "#0BE07B"];

  let xOffset = Math.abs(boundingBox.x);
  let yOffset = Math.abs(boundingBox.y);

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

      PreviewRenderer.context.fillStyle = objectColors[i % objectColors.length];

      const x = item.editorPosition.x;
      const y = item.editorPosition.y;

      if(item.editorRotation !== undefined && item.editorRotation !== 0) {
        PreviewRenderer.context.save();
        PreviewRenderer.context.translate((x + xOffset) * PreviewRenderer.SCALE, (y + yOffset) * PreviewRenderer.SCALE);
        PreviewRenderer.context.rotate(item.editorRotation * Math.PI / 180);
        PreviewRenderer.context.fillRect((-width / 2) * PreviewRenderer.SCALE, (-length / 2) * PreviewRenderer.SCALE, width * PreviewRenderer.SCALE, length * PreviewRenderer.SCALE);
        PreviewRenderer.context.restore();
      } else {
        PreviewRenderer.context.fillRect(
          (x + xOffset - width / 2) * PreviewRenderer.SCALE,
          (y + yOffset - length / 2) * PreviewRenderer.SCALE,
          width * PreviewRenderer.SCALE,
          length * PreviewRenderer.SCALE
        );
      }
    }
  }
};

/**
 * Generate a preview of the room
 * @param { { vertices: [{x: Number, y: Number}], items: [] } } room
 */
PreviewRenderer.generatePreview = function (room) {
  let { vertices, items } = room;

  let boundaryBox = PreviewRenderer.getBoundingBox(vertices);

  boundaryBox.x -= 0.25;
  boundaryBox.y -= 0.25;

  PreviewRenderer.canvas.width = (boundaryBox.w + 0.5) * PreviewRenderer.SCALE;
  PreviewRenderer.canvas.height = (boundaryBox.h + 0.5) * PreviewRenderer.SCALE;

  PreviewRenderer.context.clearRect(
    0,
    0,
    (boundaryBox.w + 0.5) * PreviewRenderer.SCALE,
    (boundaryBox.h + 0.5) * PreviewRenderer.SCALE
  );

  PreviewRenderer.drawBoundaries(vertices, boundaryBox);
  PreviewRenderer.drawItems(items, boundaryBox);

  return PreviewRenderer.canvas.toDataURL();
};

/* 
    Set up one instance of canvas that be used for rendering the previews. Re-using
    one canvas instance is better than creating them over and over again.
*/
PreviewRenderer.canvas = createCanvas(200, 200);
PreviewRenderer.context = PreviewRenderer.canvas.getContext("2d");

module.exports = PreviewRenderer;
