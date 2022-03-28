// const rethinkdb = require("rethinkdb");

const { MongoClient } = require("mongodb");

let Database = {};
Database.connection = null;

Database.setup = async function () {
  const uri = process.env.DATABASE_ADDRESS;
  const client = new MongoClient(uri);

  try {
    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    await client.db("admin").command({ ping: 1 });
    await client.db("dd_data").command({ ping: 1 });

    console.log("Connected successfully to MongoDB server");
  } catch (err) {
    console.error("ERROR: Failed to connect to MongoDB: " + err);
  }
  Database.client = client;

  try {
    /**
     * Add additional indices to the rooms collection. Indices make it more efficient to
     * query collections based on the tracked fields (in this case 'templateId').
     *
     * Note that it's safe to call on every setup since Mongodb will just ignore it if the
     * indices already exist
     */
    await client.db("dd_data").collection("rooms").createIndex({ templateId: 1 });

    /**
     * For the 'featured' property, we can use a partial index, which is even more efficient
     * since it only includes items in the index that satisfy the filter expression (which is
     * 'featured' == true in this case)
     */
    await client
      .db("dd_data")
      .collection("rooms")
      .createIndex(
        { "metaData.featured": 1 },
        { partialFilterExpression: { "metaData.featured": true } }
      );
  } catch (err) {
    console.error("ERROR: Failed to create one or more indicess for 'rooms' collection.", err);
  }
};

module.exports = Database;
