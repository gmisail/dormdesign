class RoomEditorData {
  /*
    Expects data of format:
    {
      objects: [
        id,
        position: { x, y}
      ]
    }
  */
  constructor(data) {
    this.objects = new Map(
      data.objects.map((entry) => [entry.id, { position: entry.position }])
    );
  }
}

export default RoomEditorData;
