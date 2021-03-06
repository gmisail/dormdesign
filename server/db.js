const rethinkdb = require("rethinkdb");

let Database = {};
Database.connection = null;

Database.setup = async function () {
  let conn = await rethinkdb.connect({
    host: process.env.DATABASE_ADDRESS,
    port: 28015,
  });

  Database.connection = conn;

  /*
    Ensure that the database and required tables exist. If not, then
    create them.
  */
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
  });
};

module.exports = Database;
