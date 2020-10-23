class DormItem {
  constructor(data) {
    const {
      id,
      name,
      quantity,
      claimedBy,
      width,
      length,
      height,
      editable,
      editorPosition,
    } = data ?? {};
    this.id = id;
    this.name = name.length === 0 || name === undefined ? "New Item" : name;
    this.quantity = quantity === 0 ? undefined : quantity;
    this.claimedBy = claimedBy.length === 0 ? undefined : claimedBy;
    this.dimensions = {
      width: width,
      length: length,
      height: height,
    };
    this.editable = editable ?? false;
    this.editorPosition = editorPosition;
  }
}

export default DormItem;
