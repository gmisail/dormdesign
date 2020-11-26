class EventController {
  constructor() {
    this.events = {};
  }

  on(evt, callback) {
    if (!this.events[evt]) {
      this.events[evt] = [];
    }
    this.events[evt].push(callback);
  }

  emit(evt, payload) {
    if (this.events[evt]) {
      this.events[evt].forEach((element) => {
        element(payload);
      });
    }
  }
}

export default EventController;
