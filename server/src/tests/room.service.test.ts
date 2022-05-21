import { RoomCacheService, RoomService } from "../services/room.service";

import { Cache } from "../cache";
import { Room } from "../models/room.model";

const ROOM_ID = "hello-world";
const INVALID_ROOM_ID = "does-not-exist";

const Redis = require("ioredis-mock");
const client = new Redis();

const createItem = () => {
  return {
    id: "some-item-id",
    name: "awesome item",
    quantity: 1,
    visibleInEditor: false,
    claimedBy: "jest",
    dimensions: {
      width: 5,
      height: 5,
      length: 5,
    },
    editorPosition: { x: 10, y: 10 },
    editorZIndex: 1,
    editorRotation: 0,
    editorLocked: false,
  };
};

jest.mock("ioredis", () => {
  return function () {
    return client;
  };
});

describe("Room cache", () => {
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

    const receieved = await RoomCacheService.copyRoomFrom(ROOM_ID, target.id);
    expected.metaData.lastModified = receieved.metaData.lastModified;

    expect(receieved).toStrictEqual(expected);
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

  test("if an item can be added", async () => {
    let expected = {
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
    };

    const item = createItem();

    const updatedItem = await RoomCacheService.addItem(ROOM_ID, item);
    expected.data.items.push(updatedItem);

    /**
     * By default, comparing the rooms will fail because the time that they were modified is usually
     * by a couple seconds. We're a cheating a little bit here by copying over the time, but this
     * does not affect the end result of the test.
     */
    const received = JSON.parse(await client.get(ROOM_ID)) as Room;
    expected.metaData.lastModified = received.metaData.lastModified;

    expect(received).toStrictEqual(expected);
  });

  test("if all items can be cleared", async () => {
    let original = {
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
    };

    const item = createItem();

    original.data.items.push(item);
    original.data.items.push(item);

    await client.set(ROOM_ID, JSON.stringify(original));
    await RoomCacheService.clearItems(ROOM_ID);

    const received = JSON.parse(await client.get(ROOM_ID)) as Room;

    expect(received.data.items.length).toBe(0);
    expect(received.data.items).toStrictEqual([]);
  });

  test("if an item can be removed", async () => {
    let original = {
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
    };

    const item = createItem();
    original.data.items.push(item);

    await client.set(ROOM_ID, JSON.stringify(original));
    await RoomCacheService.removeItem(ROOM_ID, "some-item-id");

    const received = JSON.parse(await client.get(ROOM_ID)) as Room;

    expect(received.data.items.length).toBe(original.data.items.length - 1);
    expect(received.data.items).not.toContainEqual(item);
  });

  test("if items can be updated", async () => {
    let original = {
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
    };

    const item = createItem();
    item.claimedBy = "test-suite";
    item.editorPosition = { x: 1.25, y: 8 };

    original.data.items.push(item);

    await client.set(ROOM_ID, JSON.stringify(original));
    await RoomCacheService.updateItems(ROOM_ID, [
      {
        id: item.id,
        updated: {
          claimedBy: "test-suite",
          editorPosition: { x: 1.25, y: 8 },
        },
      },
    ]);

    const received = JSON.parse(await client.get(ROOM_ID)) as Room;
    expect(received.data.items[0]).toStrictEqual(original.data.items[0]);
  });
});
