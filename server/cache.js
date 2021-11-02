const redis = require("async-redis");

let Cache = {};

Cache.client = redis.createClient({
  host: process.env.CACHE_ADDRESS,
  password: process.env.REDIS_PASSWORD,
});

Cache.client.on("error", function (error) {
  console.error(error);
});

module.exports = Cache;
