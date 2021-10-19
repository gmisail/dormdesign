import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./App.scss";

import { Redirect, Route, BrowserRouter as Router, Switch } from "react-router-dom";

import Footer from "./components/Footer/Footer";
import HomeRoute from "./routes/HomeRoute/HomeRoute";
import { IconContext } from "react-icons";
import NavigationBar from "./components/navbar/NavigationBar";
import React from "react";
import { RoomProvider } from "./context/RoomStore";
import { RoomRoute } from "./routes/RoomRoute/RoomRoute";
import SceneTestingRoute from "./routes/SceneTestingRoute/SceneTestingRoute";

const App = () => {
  return (
    <IconContext.Provider value={{ size: "1.6em" }}>
      <Router>
        <div className="main-content-container offset-from-footer">
          <Switch>
            <Route exact path="/" component={HomeRoute} />
            <Route component={MainRoutes} />
          </Switch>
          <Footer />
        </div>
      </Router>
    </IconContext.Provider>
  );
};

const MainRoutes = () => (
  <div className="offset-from-navbar">
    <NavigationBar></NavigationBar>
    <Switch>
      <Redirect from="/room/" to="/" exact />
      <Route exact path="/room/:id">
        <RoomProvider>
          <RoomRoute />
        </RoomProvider>
      </Route>
      <Route exact path="/scene-test" component={SceneTestingRoute} />
    </Switch>
  </div>
);

export default App;
