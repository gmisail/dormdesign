import EventController from "./EventController";

class SocketConnection {
  constructor(id, onOpen) {
    this.id = id;
    this.eventController = new EventController();
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    this.connection = new WebSocket(
      `${protocol}://${window.location.host}/ws?id=${this.id}`
    );
    this.connection.onopen = () => {
      if (onOpen !== undefined) {
        onOpen();
      }
    };

    this.connection.onerror = (err) => {
      console.error("Socket ERROR:", err);
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
  }

  set onClose(callback) {
    this.connection.onclose = (evt) => {
      console.log(evt);
      callback(evt);
    };
  }

  on(evt, callback) {
    this.eventController.on(evt, callback);
  }

  _emit(evt, payload) {
    this.eventController.emit(evt, payload);
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
