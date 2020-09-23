import React, { Component } from "react";
import { Nav, Navbar } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

class NavigationBar extends Component {

    render() {
        return (
            <Navbar bg="primary" variant="dark" expand="lg">
                <Navbar.Brand>
                    <LinkContainer to="/">
                        <div className="menu-bar">
                            DormDesign
                        </div>
                    </LinkContainer>
                    
                </Navbar.Brand>
                
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="navbar-nav">
                    <Nav className="mr-auto">
                        <LinkContainer to="/my-room">
                            <Nav.Link>My Room</Nav.Link>
                        </LinkContainer>

                        <LinkContainer to="/my-list">
                            <Nav.Link>My List</Nav.Link>
                        </LinkContainer>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }

}

export default NavigationBar;
