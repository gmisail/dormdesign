const { client } = require("../cache");
const PreviewRenderer = require("../services/preview-renderer");

let Preview = {};

Preview.CACHE_EXPIRATION = 60 * 60 * 48;

Preview.get = async function (room) {
  const id = room.id;

  let previewUrl = await client.get(`${id}:preview`);

  // doesn't exist in the cache, load it in...
  if (previewUrl === null) {
    previewUrl = PreviewRenderer.generatePreview(room);
    await client.set(`${id}:preview`, previewUrl, "EX", Preview.CACHE_EXPIRATION);
  }

  return previewUrl;
};

module.exports = Preview;
