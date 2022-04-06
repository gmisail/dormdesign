const { client } = require("../cache");
const PreviewRenderer = require("../services/preview-renderer");

let Preview = {};

Preview.CACHE_EXPIRATION = 60 * 5; // Seconds

/**
 * From a given Room ID, return the respective room preview (either from the cache or renderer)
 * @param {*} Room ID
 * @returns URI
 */
Preview.get = async function (room) {
  const id = room.id;

  let preview;
  try {
    preview = JSON.parse(await client.get(`${id}:preview`));
  } catch (err) {
    throw new Error("Failed to parse preview data stored in cache. " + err);
  }

  // If the preview isn't in the cache OR the cached version is outdated, render it
  // and add it to the cache
  if (preview === null || room.metaData.lastModified > preview.timestamp) {
    preview = {
      timestamp: Date.now(),
      data: PreviewRenderer.generatePreview(room.data),
    };

    await client.set(`${id}:preview`, JSON.stringify(preview), "EX", Preview.CACHE_EXPIRATION);
  }

  return preview;
};

module.exports = Preview;