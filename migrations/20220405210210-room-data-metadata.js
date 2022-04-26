module.exports = {
  async up(db, client) {
    await db.collection("rooms").updateMany(
      {
        // We can find the old documents by checking if they have the new schemaVersion field
        schemaVersion: { $exists: false },
      },
      [
        {
          // Set new 'metaData' fields
          $set: {
            metaData: {
              featured: false,
              lastModified: Date.now(),
            },
            // Copy data related fields under 'data'
            data: {
              vertices: "$vertices",
              items: "$items",
              name: "$name",
            },
            schemaVersion: 1,
          },
        },
        // Remove old fields
        {
          $unset: ["name", "vertices", "items"],
        },
      ]
    );
  },

  async down(db, client) {
    await db.collection("rooms").updateMany(
      {
        schemaVersion: { $exists: true },
      },
      [
        {
          $set: {
            items: "$data.items",
            name: "$data.name",
            vertices: "$data.vertices",
          },
        },
        {
          $unset: ["metaData", "data", "schemaVersion"],
        },
      ]
    );
  },
};
