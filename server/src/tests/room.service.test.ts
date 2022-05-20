import { RoomCacheService, RoomService } from "../services/room.service";

import { Cache } from "../cache";

const ROOM_ID = "hello-world";
const INVALID_ROOM_ID = "does-not-exist";

const Redis = require("ioredis-mock");
const client = new Redis();

jest.mock("ioredis", () => {
  return function () {
    return client;
  };
});

describe("Room cache service", () => {
  beforeEach(async () => {
    await client.flushall();
    await client.set(
      ROOM_ID,
      JSON.stringify({
        id: ROOM_ID,
        templateId: "template",
        data: {
          name: "Test Room",
          items: [],
          vertices: [
            { x: -5, y: -5 },
            { x: 5, y: -5 },
            { x: 5, y: 5 },
            { x: -5, y: 5 },
          ],
        },
        metaData: {
          featured: false,
          totalClones: 0,
          lastModified: Date.now(),
        },
      })
    );

    const getMockClient = jest.spyOn(Cache, "getClient");
    getMockClient.mockImplementation(() => client);
  });

  afterEach(async () => {
    await client.flushall();
  });

  test("if room exists", async () => {
    expect(await RoomCacheService.roomExists(ROOM_ID)).toBe(true);
  });

  test("if room does not exist", async () => {
    expect(await RoomCacheService.roomExists(INVALID_ROOM_ID)).toBe(false);
  });

  test("if a room can be removed by ID", async () => {
    expect(await RoomCacheService.removeRoom(ROOM_ID)).toBe(true);
    expect(await client.exists(ROOM_ID)).toBe(0);
  });

  test("if a non-existent room removal will be ignored", async () => {
    expect(await RoomCacheService.removeRoom(INVALID_ROOM_ID)).toBe(false);
  });

  test("if a room can be added to the cache", async () => {
    const newRoom = {
      id: "new-room-to-be-added",
      templateId: "template",
      data: {
        name: "Test Room",
        items: [],
        vertices: [
          { x: -5, y: -5 },
          { x: 5, y: -5 },
          { x: 5, y: 5 },
          { x: -5, y: 5 },
        ],
      },
      metaData: {
        featured: false,
        totalClones: 0,
        lastModified: Date.now(),
      },
    };

    const getMockRoom = jest.spyOn(RoomService, "getRoom");
    getMockRoom.mockImplementation((id: string) => {
      return new Promise((resolve, reject) => resolve(newRoom));
    });

    await RoomCacheService.addRoom(newRoom.id);
    expect(await client.exists(newRoom.id)).toBe(1);
  });

  test("if a room can be cloned", async () => {
    const target = {
      id: "target-room",
      templateId: "template",
      data: {
        name: "Template Room",
        items: [],
        vertices: [
          { x: -10, y: -10 },
          { x: 5, y: -5 },
          { x: 5, y: 5 },
          { x: -5, y: 5 },
        ],
      },
      metaData: {
        featured: false,
        totalClones: 0,
        lastModified: Date.now(),
      },
    };

    const getMockRoom = jest.spyOn(RoomService, "getRoom");
    getMockRoom.mockImplementation(async (id: string) => JSON.parse(await client.get(ROOM_ID)));

    const getMockTemplateRoom = jest.spyOn(RoomService, "getFromTemplateId");
    getMockTemplateRoom.mockImplementation((id: string) => Promise.resolve(target));

    const updateMockMetadata = jest.spyOn(RoomService, "updateMetadata");
    updateMockMetadata.mockImplementation(() => Promise.resolve());

    let expected = {
      id: ROOM_ID,
      templateId: "template",
      data: {
        name: "Template Room",
        items: [],
        vertices: [
          { x: -10, y: -10 },
          { x: 5, y: -5 },
          { x: 5, y: 5 },
          { x: -5, y: 5 },
        ],
      },
      metaData: {
        featured: false,
        totalClones: 0,
        lastModified: Date.now(),
      },
    };

    expect(await RoomCacheService.copyRoomFrom(ROOM_ID, target.id)).toStrictEqual(expected);
  });

  test("if a room can be modified", async () => {
    const changes = {
      name: "Updated Room Name",
      vertices: [
        { x: -10, y: -10 },
        { x: 10, y: -10 },
        { x: 10, y: 10 },
        { x: -10, y: 10 },
      ],
    };

    let expected = {
      id: ROOM_ID,
      templateId: "template",
      data: {
        name: "Updated Room Name",
        items: [],
        vertices: [
          { x: -10, y: -10 },
          { x: 10, y: -10 },
          { x: 10, y: 10 },
          { x: -10, y: 10 },
        ],
      },
      metaData: {
        featured: false,
        totalClones: 0,
        lastModified: Date.now(),
      },
    };

    const getMockRoom = jest.spyOn(RoomService, "getRoom");
    getMockRoom.mockImplementation(async (id: string) => JSON.parse(await client.get(ROOM_ID)));

    await RoomCacheService.updateRoomData(ROOM_ID, changes);

    expect(JSON.parse(await client.get(ROOM_ID)).data).toStrictEqual(expected.data);
  });

  test("if a room can be updated", async () => {
    let expected = {
      id: ROOM_ID,
      templateId: "template",
      data: {
        name: "Updated Room Name",
        items: [],
        vertices: [
          { x: -10, y: -10 },
          { x: 10, y: -10 },
          { x: 10, y: 10 },
          { x: -10, y: 10 },
        ],
      },
      metaData: {
        featured: false,
        totalClones: 0,
        lastModified: Date.now(),
      },
    };

    expect(await RoomCacheService.update(ROOM_ID, expected)).toBe(true);
    expect(JSON.parse(await client.get(ROOM_ID))).toStrictEqual(expected);
  });
});
