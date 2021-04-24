const { createCanvas } = require('canvas');

let PreviewRenderer = {};
PreviewRenderer.SCALE = 25;

/**
 * Find the bounding box that contains all of the points
 * @param { array<{ x: Number, y: Number }>} points 
 * @returns { w, h, x, y }
 */
PreviewRenderer.getBoundingBox = function(points) {
    if(points === undefined || points.length == 0)
        return { w: 0, h: 0, x: 0, y: 0 };

    let min = { x: 0, y: 0 };
    let max = { x: 0, y: 0 };

    for(let i in points) {
        const point = points[i];

        if(point.x < min.x) min.x = point.x;
        else if(point.x > max.x) max.x = point.x;

        if(point.y < min.y) min.y = point.y;
        else if(point.y > max.y) max.y = point.y;
    }

    return {
        w: max.x - min.x,
        h: max.y - min.y,
        x: min.x,
        y: min.y
    };
}

PreviewRenderer.drawBoundaries = function(points, boundingBox, ctx) {
    PreviewRenderer.context.beginPath();
    
    let xOffset = 0;
    if(boundingBox.x != 0) 
        xOffset = boundingBox.x * -1;

    let yOffset = 0;
    if(boundingBox.y != 0) 
        yOffset = boundingBox.y * -1;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      
      console.log(i)

      if (i === 0) {
        PreviewRenderer.context.moveTo((xOffset + p1.x) * PreviewRenderer.SCALE, (yOffset + p1.y) * PreviewRenderer.SCALE);
      }
      PreviewRenderer.context.lineTo((xOffset + p2.x) * PreviewRenderer.SCALE, (yOffset + p2.y) * PreviewRenderer.SCALE);
    }

    PreviewRenderer.context.closePath();
    PreviewRenderer.context.style = "black";
    PreviewRenderer.context.strokeStyle = "blue";
    PreviewRenderer.context.lineWidth = 3;
    PreviewRenderer.context.lineJoin = "butt";
    PreviewRenderer.context.lineCap = "butt";

    PreviewRenderer.context.stroke();
}

/**
 * Generate a preview of the room
 * @param { array<{ x: Number, y: Number }>} points 
 */
PreviewRenderer.generatePreview = function(points) {
    let boundaryBox = PreviewRenderer.getBoundingBox(points);
    
    PreviewRenderer.canvas.width = boundaryBox.w * PreviewRenderer.SCALE;
    PreviewRenderer.canvas.height = boundaryBox.h * PreviewRenderer.SCALE;

    PreviewRenderer.drawBoundaries(points, boundaryBox, PreviewRenderer.context);

    return PreviewRenderer.canvas.toDataURL();
}

/* 
    Set up one instance of canvas that be used for rendering the previews. Re-using
    one canvas instance is better than creating them over and over again.
*/
PreviewRenderer.canvas = createCanvas(200, 200);
PreviewRenderer.context = PreviewRenderer.canvas.getContext('2d');

module.exports = PreviewRenderer;