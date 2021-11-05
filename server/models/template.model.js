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
    targetId: id,
  };

  try {
    await Database.client
      .db("dd_data")
      .collection("templates")
      .insertOne({ ...template, _id: templateId });
  } catch (err) {
    throw new Error("Failed to create template: " + err.message);
  }

  return { ...template, id: templateId };
};

Template.get = async function (id) {
  let template;
  try {
    template = await Database.client.db("dd_data").collection("templates").findOne({ _id: id });
  } catch (error) {
    throw new Error(`Failed to get template ${id}.` + error);
  }
  if (template === null) {
    const err = new Error(`Failed to find template with id ${id}`);
    throw err;
  }

  template.id = template._id;
  delete template["_id"];

  return template;
};

module.exports = Template;
