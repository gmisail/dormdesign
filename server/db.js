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
};

module.exports = Database;
