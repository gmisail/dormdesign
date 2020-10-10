class Socket {
  static connect(id) {
    this.id = id;
    this.connection = new WebSocket("ws://localhost:8000/ws?id=" + this.id);
  }

  static send(evt, data) {
    if (data) {
      this.connection.send({
        room: this.id,
        ...data,
      });
    }
  }

  static onMessage(done) {
    this.connection.onmessage = (evt) => {
      done(evt);
    };
  }

  static onClose(done) {
    this.connection.onclose = (evt) => {
      done(evt);
    };
  }
}

export default Socket;
