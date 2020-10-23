class SocketConnection {
  constructor(id) {
    this.id = id;
    this.connection = new WebSocket("ws://localhost:8000/ws?id=" + this.id);
    this.connection.onopen = () => {
      console.log("Socket connection successfully established");
    };
  }

  set onMessage(callback) {
    this.connection.onmessage = (evt) => {
      callback(evt);
    };
  }

  set onClose(callback) {
    this.connection.onclose = (evt) => {
      callback(evt);
    };
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
