import React from 'react';
import NavigationBar from "./components/navbar";
import { Container, Row, Col, Button } from "react-bootstrap";

import {
  BrowserRouter as Router,
  Switch, 
  Route, 
  Link
} from "react-router-dom";

import "../node_modules/bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <Router>  
      <NavigationBar></NavigationBar>
      <Container>
        <div className="mt-3">
          <Row >
          <Col>
            <h2>Dorm planning, simplified.</h2>
            <p>
              DormDesign takes the miscommunication out of planning for college by offering
              free, real-time tools that simplify...
            </p>
          </Col>

          <Col>
            <Button>Create Room</Button>
          </Col>
        </Row>
        </div>
      </Container>
    </Router>
  );
}

export default App;
