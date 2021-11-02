class DormItem {
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

export default DormItem;
