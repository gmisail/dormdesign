const redis = require("async-redis");

let Cache = {};
Cache.client = redis.createClient({
  host: process.env.CACHE_ADDRESS,
});

Cache.client.on("error", function (error) {
  console.error(error);
});

module.exports = Cache;
