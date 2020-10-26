import React from "react";
import NavigationBar from "./components/navbar/NavigationBar";

import { BrowserRouter as Router, Route } from "react-router-dom";

import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import RoomRoute from "./routes/RoomRoute";
import HomeRoute from "./routes/HomeRoute";

function App() {
  return (
    <Router>
      <NavigationBar></NavigationBar>
      <div className="main-content-container">
        <Route exact path="/" component={HomeRoute} />
        <Route exact path="/room/:id" component={RoomRoute} />
      </div>
    </Router>
  );
}

export default App;
