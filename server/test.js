let PreviewRenderer = require("./services/preview-renderer.js");

console.log(
  PreviewRenderer.generatePreview({
    id: "test-id",
    items: [
      {
        dimensions: {
          height: null,
          length: 6,
          width: 3,
        },
        editorPosition: {
          x: -3.3519806504495047,
          y: -1.9128110879243918,
        },
        editorZIndex: 4,
        id: "b90ad860-a949-4e22-afd4-8449209296dc",
        name: "Bed",
        visibleInEditor: true,
      },
      {
        editorPosition: {
          x: 3.0467576791808577,
          y: -1.7525597269624322,
        },
        editorZIndex: 0,
        id: "bb48804e-deb3-4dab-a6a3-b76adaa86b96",
        name: "A",
        visibleInEditor: true,
      },
      {
        claimedBy: null,
        dimensions: {
          height: null,
          length: null,
          width: null,
        },
        editorLocked: false,
        editorPosition: {
          x: 0.06740614334467931,
          y: -3.4646757679180613,
        },
        editorRotation: 0,
        editorZIndex: 1,
        id: "9b9af46e-02f3-4c47-955b-e868cf4de421",
        name: "A",
        quantity: 1,
        visibleInEditor: true,
      },
      {
        claimedBy: null,
        dimensions: {
          height: null,
          length: null,
          width: null,
        },
        editorLocked: false,
        editorPosition: {
          x: -3.1141638225256365,
          y: 3.370307167235529,
        },
        editorRotation: 0,
        editorZIndex: 2,
        id: "2d91d7f8-07c1-4e5b-b707-dc97d655a461",
        name: "A",
        quantity: 1,
        visibleInEditor: true,
      },
      {
        claimedBy: null,
        dimensions: {
          height: null,
          length: null,
          width: null,
        },
        editorLocked: false,
        editorPosition: {
          x: 0.5392491467576326,
          y: 1.0919795221843458,
        },
        editorRotation: 0,
        editorZIndex: 3,
        id: "50366d67-807c-454e-b5b6-f87f00ff4e3d",
        name: "A",
        quantity: 1,
        visibleInEditor: true,
      },
      {
        claimedBy: null,
        dimensions: {
          height: null,
          length: 2,
          width: 1,
        },
        editorLocked: false,
        editorPosition: {
          x: -1.0062468620536285,
          y: 3.061762290915212,
        },
        editorRotation: 0,
        editorZIndex: 5,
        id: "d20c40bb-9b37-4ffa-b291-d985cc79fb44",
        name: "Bed",
        quantity: 1,
        visibleInEditor: true,
      },
    ],
    name: "My Awesome Room",
    templateId: "2c388e83-53d8-4ec7-a137-cc4007021532",
    vertices: [
      {
        x: -5,
        y: -5,
      },
      {
        x: 1.5,
        y: -5.14,
      },
      {
        x: 1.6,
        y: -2.67,
      },
      {
        x: 4.48,
        y: -2.55,
      },
      {
        x: 2.91,
        y: 2.63,
      },
      {
        x: 1.08,
        y: 5.02,
      },
      {
        x: -5,
        y: 5,
      },
    ],
  })
);
