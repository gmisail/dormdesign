const redis = require("async-redis");

let Cache = {};

Cache.client = redis.createClient({
  host: process.env.CACHE_ADDRESS,
  password: process.env.REDIS_PASSWORD,
});

/*
  Clear the cache upon server startup

  TODO: remove this once multi-core support is implemented since this
  will clear the cache whenever a new server node is added --> could be
  very bad.

  NOTE:
  I don't think this is necessary to have anymore since I've disabled all non-memory
  data persistence for Redis (meaning there is nothing saved to the HDD to be re-added when Redis
  starts) but I'll leave it for now just in case
*/
Cache.client.flushall();

Cache.client.on("error", function (error) {
  console.error("Redis Error: " + error);
});

module.exports = Cache;
