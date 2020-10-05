import React from "react";
import NavigationBar from "./components/navbar";

import { BrowserRouter as Router, Route } from "react-router-dom";

import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import RoomRoute from "./routes/room.route";

function App() {
  return (
    <Router>
      <NavigationBar></NavigationBar>

      <div className="room-container">
        <Route path="/my-room">
          <RoomRoute></RoomRoute>
        </Route>
      </div>
    </Router>
  );
}

export default App;
