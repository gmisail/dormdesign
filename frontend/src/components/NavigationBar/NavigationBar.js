import React from "react";
import { Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ReactComponent as Logo } from "../../assets/logo.svg";
import "./NavigationBar.scss";

const NavigationBar = () => {
  return (
    <Navbar fixed="top" variant="dark" expand="lg">
      <Navbar.Brand className="navbar-brand-logo" as={Link} to="/">
        <Logo />
      </Navbar.Brand>
    </Navbar>
  );
};

export default NavigationBar;
