class DormItem {
  constructor(values) {
    const { id, name, quantity, claimedBy, width, length, height } =
      values ?? {};
    this.id = id;
    this.name = name ?? "New Item";
    this.quantity = quantity ?? 1;
    this.claimedBy = claimedBy;
    this.dimensions = {
      width: width,
      length: length,
      height: height,
    };
  }
}

export default DormItem;
