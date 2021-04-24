let PreviewRenderer = require("./services/preview-renderer.js");

console.log(
  PreviewRenderer.generatePreview([
    { x: -5, y: -5 },
    { x: -0.79, y: -2.42 },
    { x: 3.64, y: -5.26 },
    { x: 5, y: 5 },
    { x: -5, y: 5 },
  ])
);
