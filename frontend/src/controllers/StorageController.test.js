import StorageController from "./StorageController";

describe("StorageController room history tests", () => {
  test("test historyGetRooms", () => {
    const mockGet = jest.fn();
    const mockSet = jest.fn();
    StorageController.get = mockGet;
    StorageController.set = mockSet;

    let history, result, expected;

    history = [
      {
        id: "1",
        name: "a",
        favorite: false,
      },
      {
        id: "2",
        name: "b",
        favorite: true,
      },
      {
        id: "3",
        name: "c",
        favorite: false,
      },
    ];
    mockGet.mockReturnValue(JSON.stringify(history));
    result = StorageController.historyGetRooms();
    expect(mockGet.mock.calls.length).toBe(1);
    expect(mockSet.mock.calls.length).toBe(0);
    expect(JSON.stringify(result)).toBe(JSON.stringify(history));

    history = [];
    mockGet.mockReturnValue(JSON.stringify(history));
    result = StorageController.historyGetRooms();
    expect(mockGet.mock.calls.length).toBe(2);
    expect(mockSet.mock.calls.length).toBe(0);
    expect(JSON.stringify(result)).toBe(JSON.stringify(history));

    history = [
      {
        id: "1",
        name: "a",
        favorite: false,
      },
      {
        id: "2",
        favorite: true,
      },
      {
        name: "c",
        favorite: false,
      },
    ];
    mockGet.mockReturnValue(JSON.stringify(history));
    result = StorageController.historyGetRooms();
    expected = [history[0]];
    expect(mockGet.mock.calls.length).toBe(3);
    expect(mockSet.mock.calls.length).toBe(1);
    expect(JSON.stringify(result)).toBe(JSON.stringify(expected));
    expect(mockSet.mock.calls[0][1]).toBe(JSON.stringify(expected));

    history = null;
    mockGet.mockReturnValue(JSON.stringify(history));
    result = StorageController.historyGetRooms();
    expected = [];
    expect(mockGet.mock.calls.length).toBe(4);
    expect(mockSet.mock.calls.length).toBe(2);
    expect(JSON.stringify(result)).toBe(JSON.stringify(expected));
    expect(mockSet.mock.calls[1][1]).toBe(JSON.stringify(expected));

    history = "a";
    mockGet.mockReturnValue(JSON.stringify(history));
    result = StorageController.historyGetRooms();
    expected = [];
    expect(mockGet.mock.calls.length).toBe(5);
    expect(mockSet.mock.calls.length).toBe(3);
    expect(JSON.stringify(result)).toBe(JSON.stringify(expected));
    expect(mockSet.mock.calls[2][1]).toBe(JSON.stringify(expected));

    history = "{<.invalid json";
    mockGet.mockReturnValue(history);
    result = StorageController.historyGetRooms();
    expected = [];
    expect(mockGet.mock.calls.length).toBe(6);
    expect(mockSet.mock.calls.length).toBe(4);
    expect(JSON.stringify(result)).toBe(JSON.stringify(expected));
    expect(mockSet.mock.calls[3][1]).toBe(JSON.stringify(expected));
  });

  test("test historyAddRoom", () => {
    let history = [
      {
        id: "1",
        name: "a",
        favorite: false,
      },
      {
        id: "2",
        name: "b",
        favorite: true,
      },
      {
        id: "3",
        name: "c",
        favorite: false,
      },
    ];
    const mockGet = jest.fn().mockReturnValue(JSON.stringify(history));
    const mockSet = jest.fn();
    StorageController.get = mockGet;
    StorageController.set = mockSet;

    StorageController.historyAddRoom("5", "d");
    let expected = [
      {
        id: "5",
        name: "d",
        favorite: false,
      },
      ...history,
    ];
    expect(mockSet.mock.calls.length).toBe(1);
    expect(mockSet.mock.calls[0][1]).toBe(JSON.stringify(expected));

    history = [];
    for (let i = 0; i < StorageController.HISTORY_MAX_LENGTH; i++) {
      history.push({
        id: i,
        name: i,
        favorite: false,
      });
    }
    mockGet.mockReturnValue(JSON.stringify(history));

    StorageController.historyAddRoom("a", "a");
    expected = [
      {
        id: "a",
        name: "a",
        favorite: false,
      },
      ...history.slice(0, StorageController.HISTORY_MAX_LENGTH - 1),
    ];
    expect(mockSet.mock.calls.length).toBe(2);
    expect(mockSet.mock.calls[1][1]).toBe(JSON.stringify(expected));
  });

  test("test historyRemoveRoom", () => {
    const history = [
      {
        id: "1",
        name: "a",
        favorite: false,
      },
      {
        id: "2",
        name: "b",
        favorite: true,
      },
      {
        id: "3",
        name: "c",
        favorite: false,
      },
    ];
    const mockGet = jest.fn().mockReturnValue(JSON.stringify(history));
    const mockSet = jest.fn();
    StorageController.get = mockGet;
    StorageController.set = mockSet;

    let expected;

    StorageController.historyRemoveRoom("4");
    expected = history;
    expect(mockSet.mock.calls.length).toBe(1);
    expect(mockSet.mock.calls[0][1]).toBe(JSON.stringify(expected));

    StorageController.historyRemoveRoom("3");
    expected = history.slice(0, 2);
    expect(mockSet.mock.calls.length).toBe(2);
    expect(mockSet.mock.calls[1][1]).toBe(JSON.stringify(expected));

    StorageController.historyRemoveRoom("1");
    expected = history.slice(1);
    expect(mockSet.mock.calls.length).toBe(3);
    expect(mockSet.mock.calls[2][1]).toBe(JSON.stringify(expected));

    mockGet.mockReturnValue(JSON.stringify([]));
    StorageController.historyRemoveRoom("1");
    expect(mockSet.mock.calls.length).toBe(4);
    expect(mockSet.mock.calls[3][1]).toBe(JSON.stringify([]));
  });

  test("test historyUpdateRoomNames", () => {
    const history = [
      {
        id: "1",
        name: "a",
        favorite: false,
      },
      {
        id: "2",
        name: "b",
        favorite: true,
      },
      {
        id: "3",
        name: "c",
        favorite: false,
      },
    ];
    const mockGet = jest.fn().mockReturnValue(JSON.stringify(history));
    const mockSet = jest.fn();
    StorageController.get = mockGet;
    StorageController.set = mockSet;

    StorageController.historyUpdateRoomNames({ 4: "d" });
    expect(mockSet.mock.calls.length).toBe(1);
    expect(mockSet.mock.calls[0][1]).toBe(JSON.stringify(history));

    StorageController.historyUpdateRoomNames({ 6: "d" });
    expect(mockSet.mock.calls.length).toBe(2);
    expect(mockSet.mock.calls[1][1]).toBe(JSON.stringify(history));

    StorageController.historyUpdateRoomNames({ 3: "d" });
    history[2].name = "d";
    expect(mockSet.mock.calls.length).toBe(3);
    expect(mockSet.mock.calls[2][1]).toBe(JSON.stringify(history));

    StorageController.historyUpdateRoomNames({ 1: "d", 2: "d" });
    history[0].name = "d";
    history[1].name = "d";
    history[2].name = "c";
    expect(mockSet.mock.calls.length).toBe(4);
    expect(mockSet.mock.calls[3][1]).toBe(JSON.stringify(history));

    mockGet.mockReturnValue(JSON.stringify([]));
    StorageController.historyFavoriteRoom({ 1: "d", 2: "d" });
    expect(mockSet.mock.calls.length).toBe(5);
    expect(mockSet.mock.calls[4][1]).toBe(JSON.stringify([]));
  });

  test("test historyFavoriteRoom", () => {
    const history = [
      {
        id: "1",
        name: "a",
        favorite: false,
      },
      {
        id: "2",
        name: "b",
        favorite: true,
      },
      {
        id: "3",
        name: "c",
        favorite: false,
      },
    ];
    const mockGet = jest.fn().mockReturnValue(JSON.stringify(history));
    const mockSet = jest.fn();
    StorageController.get = mockGet;
    StorageController.set = mockSet;

    StorageController.historyFavoriteRoom("2");
    expect(mockSet.mock.calls.length).toBe(1);
    expect(mockSet.mock.calls[0][1]).toBe(JSON.stringify(history));

    StorageController.historyFavoriteRoom("4");
    expect(mockSet.mock.calls.length).toBe(2);
    expect(mockSet.mock.calls[1][1]).toBe(JSON.stringify(history));

    StorageController.historyFavoriteRoom("1");
    history[0].favorite = true;
    expect(mockSet.mock.calls.length).toBe(3);
    expect(mockSet.mock.calls[2][1]).toBe(JSON.stringify(history));
    history[0].favorite = false;

    StorageController.historyFavoriteRoom("3");
    history[2].favorite = true;
    expect(mockSet.mock.calls.length).toBe(4);
    expect(mockSet.mock.calls[3][1]).toBe(JSON.stringify(history));

    mockGet.mockReturnValue(JSON.stringify([]));
    StorageController.historyFavoriteRoom("3");
    expect(mockSet.mock.calls.length).toBe(5);
    expect(mockSet.mock.calls[4][1]).toBe(JSON.stringify([]));
  });
});
