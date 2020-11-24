class SocketConnection {
  constructor(id, onOpen) {
    this.id = id;
    this.connection = new WebSocket("ws://localhost:8000/ws?id=" + this.id);
    this.connection.onopen = () => {
      if (onOpen !== undefined) {
        onOpen();
      }
    };

    this.connection.onmessage = (evt) => {
      let data = undefined;
      try {
        data = JSON.parse(evt.data);
        if (data.event !== undefined) {
          this._emit(data.event, data.data);
        } else {
          console.error("Socket message received with no event field: ", data);
        }
      } catch (e) {
        console.error("Error parsing socket message: ", evt.data, e);
      }
    };

    this.events = [];
  }

  set onClose(callback) {
    this.connection.onclose = (evt) => {
      callback(evt);
    };
  }

  on(evt, callback) {
    if (!this.events[evt]) {
      this.events[evt] = [];
    }

    this.events[evt].push(callback);
  }

  _emit(evt, payload) {
    if (this.events[evt]) {
      this.events[evt].forEach((element) => {
        element(payload);
      });
    }
  }

  send(data) {
    if (!data) return;
    this.connection.send(
      JSON.stringify({
        room: this.id,
        ...data,
      })
    );
  }
}

export default SocketConnection;
