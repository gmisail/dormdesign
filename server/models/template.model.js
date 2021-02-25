const rethinkdb = require("rethinkdb");
const { v4: uuidv4 } = require('uuid');
const database = require('../db');

var Template = {};

Template.create = async function(id)
{
    const templateId = uuidv4();
    const template = {
        id: templateId,
        targetId: id
    };

    await rethinkdb.db("dd_data").table("templates").insert(template).run(database.connection);
    
    return templateId;
}

Template.get = function(id)
{

}

module.exports = Template;