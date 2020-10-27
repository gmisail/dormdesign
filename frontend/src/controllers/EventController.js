class EventController {
  static create() {
    this.events = [];
  }

  static on(evt, callback) {
    if (!this.events[evt]) {
      this.events[evt] = [];
    }

    this.events[evt].push(callback);
  }

  static emit(evt, payload) {
    if (this.events[evt]) {
      this.events[evt].forEach((element) => {
        element(payload);
      });
    } else {
      throw new Error("Cannot find event with name '" + evt + "'");
    }
  }
}

export default EventController;
