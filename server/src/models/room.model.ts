import Joi, { number } from "joi";

import { Item } from "./item.model";
import { ObjectId } from "mongodb";
import { Position, PositionSchema } from "./position.model";

type RoomData = {
  templateId: string;
  data: {
    name: string;
    items: Array<Item>;
    vertices: Array<Position>;
  };
  metaData: {
    featured: boolean;
    lastModified: number; // data is represented in Unix time.
    totalClones: number; // number of times this room has been cloned
  };
};

type Room = { id: string } & RoomData;

// RoomDocument is MongoDB's representation of a room
type RoomDocument = { _id: ObjectId } & RoomData;

type RoomUpdate = {
  name: string;
  vertices: Array<Position>;
};

const RoomNameSchema = Joi.string().min(1).max(40);

/**
 * Schema to validate updates on the `data` field of a Room. (Note that updates to the `data.items` array are not included
 * in this schemas as those updates are handled separately)
 */
const UpdateRoomDataSchema = Joi.object({
  // This shouldn't include the items array. Items should be updated separately.
  // We could allow items to be updated here as well but that would require a lot more complex validation
  name: RoomNameSchema,
  // There must be at least 3 vertices in the room
  vertices: Joi.array().min(3).items(PositionSchema),
});

/**
 * MongoDB requires documents to use _id as an identifier, while internally it uses id. This
 * simply prepares the internal Room model for use in MongoDB.
 * @param room
 */
function roomToDocument(room: Room): RoomDocument {
  let document: any = { ...room, _id: room.id };
  delete document.id;
  return document;
}

/**
 * Converts MongoDB document to Room.
 * @param roomDoc
 * @returns
 */
function documentToRoom(roomDoc: RoomDocument): Room {
  let document: any = { ...roomDoc, id: roomDoc._id };
  delete document._id;
  return document;
}

export {
  UpdateRoomDataSchema,
  roomToDocument,
  documentToRoom,
  Room,
  RoomDocument,
  RoomUpdate,
  RoomData,
  RoomNameSchema,
};
