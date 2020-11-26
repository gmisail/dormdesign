import React from "react";
import NavigationBar from "./components/navbar/NavigationBar";

import { BrowserRouter as Router, Route } from "react-router-dom";

import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
// import RoomRoute from "./routes/RoomRoute/RoomRoute";
// import RoomRouteFunc from "./routes/RoomRoute/RoomRouteFunc";
import HomeRoute from "./routes/HomeRoute/HomeRoute";
import { IconContext } from "react-icons";

import { RoomProvider } from "./routes/RoomRoute/RoomContext";
import { RoomRouteNew } from "./routes/RoomRoute/RoomRouteNew";

import "./App.scss";

function App() {
  return (
    <Router>
      <IconContext.Provider value={{ size: "1.6em" }}>
        <NavigationBar></NavigationBar>
        <div className="main-content-container">
          <Route exact path="/" component={HomeRoute} />
          <RoomProvider>
            <Route exact path="/room/:id" component={RoomRouteNew} />
          </RoomProvider>
        </div>
      </IconContext.Provider>
    </Router>
  );
}

export default App;
