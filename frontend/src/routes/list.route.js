import React, { Component } from "react";
import { ListGroup } from "react-bootstrap";
import ListItem from "../components/ListItem/ListItem";
import ButtonGroup from "../components/ButtonGroup";

class ListRoute extends Component {

    onAddPressed() {
        console.log("add item");
    }

    onEditPressed() {
        console.log("edit items");
    }

    render() {
        return <div>
            <h2>My List</h2>
            <div className="mb-3">
                <ListGroup>
                    <ListItem itemName="Soundbar" itemQty={1} />
                    <ListItem itemName="Floor lamp" claimedName="John Smith" />
                    <ListItem itemName="LED Strips" itemQty={4} />
                </ListGroup>

                <ButtonGroup buttons={[
                    { name: "Edit", color: "primary", onClick: this.onEditPressed },
                    { name: "Add", color: "primary", onClick: this.onAddPressed }
                ]} />
            </div>
        </div>
    }
}

export default ListRoute;