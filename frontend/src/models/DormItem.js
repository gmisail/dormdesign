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
      editorZIndex,
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
    this.editorZIndex = editorZIndex ? editorZIndex : 0;
  }

  update(updated) {
    /* 
      Ensure that updated is deep merged into this.
      TODO: Maybe replace hardcoded method below with an actual deepmerge function?
    */
    if (updated.name !== undefined) {
      this.name = updated.name;
    }
    if (updated.quantity !== undefined) {
      this.quantity = updated.quantity;
    }
    if (updated.claimedBy !== undefined) {
      this.claimedBy = updated.claimedBy;
    }
    if (updated.dimensions !== undefined) {
      const w = updated.dimensions.width;
      const l = updated.dimensions.length;
      const h = updated.dimensions.height;
      this.dimensions = {
        width: w === undefined ? this.dimensions.width : w,
        length: l === undefined ? this.dimensions.length : l,
        height: h === undefined ? this.dimensions.height : h,
      };
    }
    if (updated.visibleInEditor !== undefined) {
      this.visibleInEditor = updated.visibleInEditor;
    }
    if (updated.editorPosition !== undefined) {
      const x = updated.editorPosition.x;
      const y = updated.editorPosition.y;
      this.editorPosition = {
        x: x === undefined ? this.editorPosition.x : x,
        y: y === undefined ? this.editorPosition.y : y,
      };
    }
    if (updated.editorRotation !== undefined) {
      this.editorRotation = updated.editorRotation;
    }
    if (updated.editorLocked !== undefined) {
      this.editorLocked = updated.editorLocked;
    }
    if (updated.editorZIndex !== undefined) {
      this.editorZIndex = updated.editorZIndex;
    }
  }
}

export default DormItem;
