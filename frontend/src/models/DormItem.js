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
    } = data ?? {};
    this.id = id;
    this.name = name === undefined || name.length === 0 ? "New Item" : name;
    this.quantity = quantity ?? 1;
    this.claimedBy =
      claimedBy === undefined || claimedBy.length === 0 ? undefined : claimedBy;

    this.dimensions = dimensions
      ? {
          width: dimensions.width,
          length: dimensions.length,
          height: dimensions.height,
        }
      : { width: undefined, length: undefined, height: undefined };
    this.visibleInEditor = visibleInEditor ?? false;
    this.editorPosition = editorPosition;
  }
}

export default DormItem;
