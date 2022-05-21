import "./App.scss";

import { Route, BrowserRouter as Router, Switch } from "react-router-dom";

import Footer from "./components/Footer/Footer";
import HomeRoute from "./routes/HomeRoute/HomeRoute";
import { IconContext } from "react-icons";
import NavigationBar from "./components/NavigationBar/NavigationBar";
import React from "react";
import { RoomProvider } from "./context/RoomStore";
import { RoomRoute } from "./routes/RoomRoute/RoomRoute";
import SceneTestingRoute from "./routes/SceneTestingRoute/SceneTestingRoute";
import { TemplateGalleryRoute } from "./routes/TemplateGalleryRoute/TemplateGalleryRoute";
import { TemplateRoute } from "./routes/TemplateRoute/TemplateRoute";
import { UnknownRoute } from "./routes/UnknownRoute/UnknownRoute";

const App = () => {
  return (
    <IconContext.Provider value={{ size: "1.6em" }}>
      <Router>
        <div className="main-content-container">
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
    <NavigationBar />
    <Switch>
      <Route exact path="/room/:id">
        <RoomProvider>
          <RoomRoute />
        </RoomProvider>
      </Route>
      <Route exact path="/template/:id">
        <RoomProvider>
          <TemplateRoute />
        </RoomProvider>
      </Route>
      <Route exact path="/templates" component={TemplateGalleryRoute} />
      <Route exact path="/scene-test" component={SceneTestingRoute} />
      <Route component={UnknownRoute} />
    </Switch>
  </div>
);

export default App;
