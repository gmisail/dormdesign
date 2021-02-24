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

    await Template.db.db("dd_data").table("templates").insert(template).exec(database.connection);

    return template;
}

Template.get = function(id)
{

}

module.exports = Template;