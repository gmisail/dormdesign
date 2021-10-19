const Database = require("../db");
const { v4: uuidv4 } = require("uuid");

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
  let template;
  try {
    template = await Database.client.db("dd_data").collection("templates").findOne({ _id: id });
  } catch (err) {
    throw new Error(`Failed to get template ${id}: ` + err);
  }

  return template;
};

module.exports = Template;
