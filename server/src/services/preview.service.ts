import { Cache } from "../cache";
import {Room} from "../models/room.model";

const PreviewRenderer = require("../services/preview-renderer");

class PreviewService {
    /**
     * From a given Room ID, return the respective room preview (either from the cache or renderer)
     * @param {*} Room ID
     * @returns URI
     */
    static async generatePreview(room: Room): Promise<{ timestamp: number, data: string }> {
        const id = room.id;

        let preview;
        try {
            preview = JSON.parse(await Cache.getClient().get(`${id}:preview`));
        } catch (err) {
            throw new Error("Failed to parse preview data stored in cache. " + err);
        }

        /*
          If the preview isn't in the cache OR the cached version is outdated, render it
          and add it to the cache
        */
        if (preview === null || room.metaData.lastModified > preview.timestamp) {
            preview = {
                timestamp: Date.now(),
                data: PreviewRenderer.generatePreview(room.data),
            };

            await Cache.getClient().set(`${id}:preview`, JSON.stringify(preview));
        }

        return preview;
    }
}

export { PreviewService };
