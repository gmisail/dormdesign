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

PreviewRenderer.drawItems = function(items, boundingBox) {
  let xOffset = 0;
  if (boundingBox.x != 0) xOffset = boundingBox.x * -1;

  let yOffset = 0;
  if (boundingBox.y != 0) yOffset = boundingBox.y * -1;

  for(let i in items) {
    const item = items[i];

    console.log(item)

    if(item.visibleInEditor) {
      const width = (item.dimensions === undefined || item.dimensions.width == null) ? 1 : item.dimensions.width;
      const length = (item.dimensions === undefined || item.dimensions.length == null) ? 1 : item.dimensions.length;
      
      PreviewRenderer.context.fillStyle = "red";
      PreviewRenderer.context.fillRect(
        (item.editorPosition.x + xOffset - (width / 2)) * PreviewRenderer.SCALE, 
        (item.editorPosition.y + yOffset - (length / 2)) * PreviewRenderer.SCALE, 
        width * PreviewRenderer.SCALE, 
        length * PreviewRenderer.SCALE
      );
    }
  }
}

/**
 * Generate a preview of the room
 * @param { { vertices: [{x: Number, y: Number}], items: [] } } room
 */
PreviewRenderer.generatePreview = function (room) {
  let { vertices, items } = room;
  
  let boundaryBox = PreviewRenderer.getBoundingBox(vertices);

  PreviewRenderer.canvas.width = boundaryBox.w * PreviewRenderer.SCALE;
  PreviewRenderer.canvas.height = boundaryBox.h * PreviewRenderer.SCALE;

  PreviewRenderer.context.clearRect(0, 0, boundaryBox.w * PreviewRenderer.SCALE, boundaryBox.h * PreviewRenderer.SCALE);
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
