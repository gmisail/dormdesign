class SocketConnection {
  constructor(id) {
    this.id = id;
    this.connection = new WebSocket("ws://localhost:8000/ws?id=" + this.id);
    this.connection.onopen = () => {
      console.log("Socket connection successfully established");
    };
  }

  // Receives incoming messages and parses the data JS objects
  set onMessage(callback) {
    this.connection.onmessage = (evt) => {
      let data = undefined;
      try {
        data = JSON.parse(evt.data);
        console.log("SUCCESS", evt.data);
      } catch (e) {
        console.error("Error parsing socket message data: ", evt.data, e);
      }
      if (data) {
        callback(data);
      }
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
