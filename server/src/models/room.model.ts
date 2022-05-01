import Joi, { number } from "joi";
import { Item } from "./item.model";

type Room = {
  id: string,
  templateId: string;
  data: {
    name: string;
    items: Array<Item>;
    vertices: Array<{
      x: number;
      y: number;
    }>;
  };
  metaData: {
    featured: boolean;
    lastModified: number; // data is represented in Unix time.
  };
};

const vertexSchema = Joi.object({
  x: Joi.number().precision(4).default(0),
  y: Joi.number().precision(4).default(0),
});

// This shouldn't include the items array. Items should be updated separately.
// We could allow items to be updated here as well but that would require a lot more complex validation
const updateRoomDataSchema = Joi.object({
  name: Joi.string().min(1).max(40),
  // There must be at least 3 vertices in the room
  vertices: Joi.array().min(3).items(vertexSchema),
});

/**
 * MongoDB requires documents to use _id as an identifier, while internally it uses id. This
 * simply prepares the internal Room model for use in MongoDB.
 * @param room 
 */
function roomAsDocument(room: Room): any {
  let document: any = { ...room, _id: room.id };
  delete document.id;
  return document;
}

export { updateRoomDataSchema, roomAsDocument, Room };
