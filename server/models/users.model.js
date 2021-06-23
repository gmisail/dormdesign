const { client } = require("../cache");

let Users = {};

/**
 * Returns a map of socket ID's to nicknames
 * @param { string } id
 * @returns Map of socket id's => nicknames
 */
Users.inRoom = async function (id) {
  let users = await client.hgetall(`${id}:users`);

  return users;
};

/**
 * Deletes the hashmap in the cache that stores the currently users
 * @param { string } id
 */
Users.deleteRoom = async function (id) {
  await client.del(`${id}:users`);
};

/**
 * Adds a new user to a room. If a user already exists with a given ID, overwrite their
 * nickname with the given nickname.
 * @param { string } id
 * @param { string } userId
 * @param { string } nickname
 */
Users.add = async function (id, userId, nickname) {
  //
  // TODO: sanitize nickname
  //

  await client.hmset(`${id}:users`, { [userId]: nickname });
};

/**
 * Remove a user from a room
 * @param { string } id
 * @param { string } userId
 */
Users.remove = async function (id, userId) {
  await client.hdel(`${id}:users`, userId);
};

module.exports = Users;
