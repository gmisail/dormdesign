export default class DormItemModel {
  static MAX_NAME_LENGTH = 30;

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
