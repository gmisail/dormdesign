import React from 'react';
import NavigationBar from "./components/navbar";
import { Container } from "react-bootstrap";

import {
  BrowserRouter as Router,
  Route
} from "react-router-dom";

import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import ListRoute from './routes/list.route';
import EditorRoute from './routes/editor.route';

function App() {
  return (
    <Router>  
      <NavigationBar></NavigationBar>
      <Container>
        <div className="mt-3">
          <Route path="/my-list">
            <ListRoute></ListRoute>
          </Route>
          <Route path="/my-room">
            <EditorRoute></EditorRoute>
          </Route>
        </div>
     </Container>
    </Router>
  );
}

export default App;
