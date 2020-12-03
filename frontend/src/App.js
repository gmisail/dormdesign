import React from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./App.scss";

import NavigationBar from "./components/navbar/NavigationBar";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import HomeRoute from "./routes/HomeRoute/HomeRoute";
import { IconContext } from "react-icons";

import { RoomProvider } from "./routes/RoomRoute/RoomContext";
import { RoomRoute } from "./routes/RoomRoute/RoomRoute";

const App = () => {
  return (
    <IconContext.Provider value={{ size: "1.6em" }}>
      <Router>
        <Switch>
          <Route exact path="/" component={HomeRoute} />
          <Route component={MainRoutes} />
        </Switch>
      </Router>
    </IconContext.Provider>
  );
};

const MainRoutes = () => (
  <div className="main-content-container">
    <NavigationBar></NavigationBar>
    <Route exact path="/room/:id">
      <RoomProvider>
        <RoomRoute />
      </RoomProvider>
    </Route>
  </div>
);

export default App;
