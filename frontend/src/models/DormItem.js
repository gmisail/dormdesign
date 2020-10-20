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
    this.name = name ?? "New Item";
    this.quantity = quantity ?? 1;
    this.claimedBy = claimedBy;
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
