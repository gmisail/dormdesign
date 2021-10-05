// const rethinkdb = require("rethinkdb");

const { MongoClient } = require("mongodb");

let Database = {};
Database.connection = null;

Database.setup = async function () {
  /* let conn = await rethinkdb.connect({
    host: process.env.DATABASE_ADDRESS,
    port: 28015,
  });*/

  const password = "<password>";
  const name = "<name>";

  const { MongoClient } = require("mongodb");
  const uri = `mongodb+srv://${name}:${password}@dd-cluster-0.m5lsl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
  const client = new MongoClient(uri);

  await client.connect().catch((err) => {
    const collection = client.db("test").collection("devices");
    // perform actions on the collection object
    client.close();
  });

  if (!client) return;

  Database.connection = client;

  /*
    Ensure that the database and required tables exist. If not, then
    create them.
  */

  await client.hello();

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
