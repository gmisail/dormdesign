export default class DormItemModel {
  static MAX_NAME_LENGTH = 30;
  static MAX_QUANTITY = 1000;

  // Max/min values for width & length
  static MAX_DIMENSION_SIZE = 100;
  static MIN_DIMESNION_SIZE = 0;

  static getDefault() {
    return {
      name: "New Item",
      quantity: 1,
      visibleInEditor: false,
      claimedBy: null,
      dimensions: {
        width: null,
        length: null,
        height: null,
      },
      editorPosition: {
        x: 0,
        y: 0,
      },
      editorRotation: 0,
      editorLocked: false,
      editorZIndex: 0,
    };
  }
}
