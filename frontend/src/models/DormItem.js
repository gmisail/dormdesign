class DormItem {
  constructor(values) {
    const {
      id,
      name,
      quantity,
      claimedBy,
      width,
      length,
      height,
      includeInEditor,
      editorPosition,
    } = values ?? {};
    this.id = id;
    this.name = name ?? "New Item";
    this.quantity = quantity ?? 1;
    this.claimedBy = claimedBy;
    this.dimensions = {
      width: width,
      length: length,
      height: height,
    };
    this.editor = {
      included: includeInEditor ?? true,
      position: editorPosition,
    };
  }
}

export default DormItem;
