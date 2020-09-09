import React, { Component } from "react";
import { Nav, Navbar } from "react-bootstrap";

class NavigationBar extends Component {

    render() {
        return (
            <Navbar bg="primary" variant="dark" expand="lg">
                <Navbar.Brand href="#home">
                    <div className="menu-bar">
                        DormDesign
                    </div>
                </Navbar.Brand>
                
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link href="#home">My Room</Nav.Link>
                        <Nav.Link href="#link">My List</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }

}

export default NavigationBar;
