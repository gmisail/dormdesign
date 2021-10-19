// const rethinkdb = require("rethinkdb");

const { MongoClient } = require("mongodb");

let Database = {};
Database.connection = null;

Database.setup = async function () {
  /* let conn = await rethinkdb.connect({
    host: process.env.DATABASE_ADDRESS,
    port: 28015,
  });*/
  const uri = process.env.DATABASE_ADDRESS;
  // const uri = `mongodb+srv://${name}:${password}@dd-cluster-0.m5lsl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
  // console.log("URI", uri, process.env);
  const client = new MongoClient(uri);

  try {
    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    await client.db("admin").command({ ping: 1 });
    await client.db("dd_data").command({ ping: 1 });

    // const collection = client
    //   .db("test")
    //   .collection("test_collection")
    //   .insertOne({ name: "testName" });
    console.log("Connected successfully to MongoDB server");
  } catch (err) {
    console.error("ERROR: Failed to connect to MongoDB: " + err);
  }

  Database.client = client;

  /*
    Ensure that the database and required tables exist. If not, then
    create them.
  */

  /// create db....

  /*
  rethinkdb.dbCreate("dd_data").run(Database.connection, (err) => {
    rethinkdb
      .db("dd_data")
      .tableCreate("rooms")
      .run(Database.connection, (err, res) => {
        if (!err) console.log("Successfully created table 'rooms'");
      });

    rethinkdb
      .db("dd_data")
      .tableCreate("templates")
      .run(Database.connection, (err, res) => {
        if (!err) console.log("Successfully created table 'templates'");
      });
  });*/
};

module.exports = Database;
