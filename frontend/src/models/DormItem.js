class DormItem {
  constructor(data) {
    const {
      id,
      name,
      quantity,
      claimedBy,
      dimensions,
      visibleInEditor,
      editorPosition,
      editorRotation,
      editorLocked,
    } = data ?? {};
    this.id = id;
    this.name = name ? name : "New Item";
    this.quantity = quantity ? quantity : 1;
    this.claimedBy = claimedBy ? claimedBy : null;

    this.dimensions = {
      width: dimensions?.width ? dimensions.width : null,
      length: dimensions?.length ? dimensions.length : null,
      height: dimensions?.height ? dimensions.height : null,
    };
    this.visibleInEditor = visibleInEditor ?? false;
    this.editorPosition = {
      x: editorPosition?.x ? editorPosition.x : null,
      y: editorPosition?.y ? editorPosition.y : null,
    };
    this.editorRotation = editorRotation ? editorRotation : 0;
    this.editorLocked = editorLocked ? editorLocked : false;
  }

  update(updated) {
    for (const [key, value] of Object.entries(updated)) {
      if (value !== undefined) {
        this[key] = value;
      }
    }
  }
}

export default DormItem;
