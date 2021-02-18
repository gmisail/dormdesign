const rethinkdb = require("rethinkdb");

let Database = {};
Database.connection = null;

Database.setup = function()
{
    rethinkdb.connect({ host: process.env.DATABASE_ADDRESS, port: 28015 }, (err, conn) => {
        if(err) throw err;

        Database.connection = conn;
    
        /*
            Ensure that the database and required tables exist. If not, then
            create them.
        */
        rethinkdb.dbCreate('dd_data').run(Database.connection, (err) => {            
            rethinkdb.db('dd_data').tableCreate('rooms').run(Database.connection, (err, res) => {
                if(!err) console.log("Creating table 'rooms'");
            });      
    
            rethinkdb.db('dd_data').tableCreate('templates').run(Database.connection, (err, res) => {
                if(!err) console.log("Creating table 'templates'");
            });
        })
    });
}

module.exports = Database;