import React from "react";
import NavigationBar from "./components/navbar";

import { BrowserRouter as Router, Route } from "react-router-dom";

import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import ListRoute from "./routes/list.route";
import EditorRoute from "./routes/editor.route";

function App() {
  return (
    <Router>
      <NavigationBar></NavigationBar>

      <div className="room-container">
        <Route path="/my-list">
          <ListRoute></ListRoute>
        </Route>
        <Route path="/my-room">
          <EditorRoute></EditorRoute>
        </Route>
      </div>
    </Router>
  );
}

export default App;
