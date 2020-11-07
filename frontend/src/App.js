import React from "react";
import NavigationBar from "./components/navbar/NavigationBar";

import { BrowserRouter as Router, Route } from "react-router-dom";

import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import RoomRoute from "./routes/RoomRoute/RoomRoute";
import HomeRoute from "./routes/HomeRoute/HomeRoute";
import EventController from "./controllers/EventController";
import { IconContext } from "react-icons";

import "./App.css";

function App() {
  EventController.create();

  return (
    <Router>
      <IconContext.Provider value={{ size: "1.6em" }}>
        <NavigationBar></NavigationBar>
        <div className="main-content-container">
          <Route exact path="/" component={HomeRoute} />
          <Route exact path="/room/:id" component={RoomRoute} />
        </div>
      </IconContext.Provider>
    </Router>
  );
}

export default App;
