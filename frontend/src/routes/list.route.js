import React, { Component } from "react";
import { Card, ListGroup, Button } from "react-bootstrap";
import ListItem from "../components/ListItem/ListItem";

class ListRoute extends Component {

    render() {
        return <div>
            <h2>My List</h2>
            <div className="mb-3">
                <ListGroup>
                    <ListItem itemName="Soundbar" itemQty={1} />
                    <ListItem itemName="Floor lamp" claimedName="John Smith" />
                    <ListItem itemName="LED Strips" itemQty={4} />
                </ListGroup>
            </div>
        </div>
    }

}

export default ListRoute;