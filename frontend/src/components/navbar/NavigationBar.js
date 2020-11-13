import React from "react";
import { Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./NavigationBar.scss";

const NavigationBar = () => {
  return (
    <Navbar fixed="top" variant="dark" expand="lg">
      <Navbar.Brand className="navbar-brand-logo" as={Link} to="/">
        DormDesign
      </Navbar.Brand>

      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="navbar-nav">
        <Nav className="mr-auto"></Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavigationBar;
