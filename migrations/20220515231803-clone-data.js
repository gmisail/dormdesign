module.exports = {
  async up(db, client) {
    await db.collection("rooms").updateMany(
      {
        // find fields that have previous schema version
        schemaVersion: { $eq: 1 },
      },
      [
        {
          $set: {
            "metaData.totalClones": 0,
            schemaVersion: 2,
          },
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
          $unset: ["metaData.totalClones"],
        },
      ]
    );
  },
};
