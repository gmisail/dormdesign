// const rethinkdb = require("rethinkdb");
const Database = require("../db");
const { v4: uuidv4 } = require("uuid");
// const database = require("../db");

var Template = {};

/**
 * Create a template within the database
 * @param { string } id
 */
Template.create = async function (id) {
  const templateId = uuidv4();
  const template = {
    _id: templateId,
    targetId: id,
  };

  try {
    await Database.client.db("dd_data").collection("templates").insertOne(template);
  } catch (err) {
    throw new Error("Failed to create template: " + err.message);
  }

  return templateId;
};

Template.get = async function (id) {
  console.log(id);
  const template = await rethinkdb
    .db("dd_data")
    .table("templates")
    .get(id)
    .run(database.connection);

  return template;
};

module.exports = Template;
