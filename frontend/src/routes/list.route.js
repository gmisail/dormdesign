import React, { Component } from "react";
import { Container, Row, Col, ListGroup, Button } from "react-bootstrap";
import Modal from 'react-bootstrap/Modal';
import ListItem from "../components/ListItem/ListItem";
import ListItemForm from "../components/ListItemForm/ListItemForm";

let TEST_ID_COUNTER = 0;
const TEST_ITEMS = [
    {
        id: TEST_ID_COUNTER++,
        name: "Fridge",
        quantity: 4,
        claimedBy: undefined,
    },
    {
        id: TEST_ID_COUNTER++,
        name: "Soundbar",
        quantity: 1,
        claimedBy: "John Smith",
    },
    {
        id: TEST_ID_COUNTER++,
        name: "Microwave",
        quantity: 10,
        claimedBy: undefined,
    },
]

class ListRoute extends Component {

    constructor() {
        super();

        this.state = { 
            items: TEST_ITEMS,
            showModal: false,
            modalType: "none",
        };
    }

    addNewItem = (item) => {
        item.id = TEST_ID_COUNTER++;
        if (item.name.length === 0) {
            item.name = "New Item";
        }
        this.setState({
            items: [...this.state.items, item]
        })
        this.toggleModal();
    }
    
    renderItems() {
        return (
            <ListGroup>
                {!this.state.items.length ? (
                    <h6>No items have been added yet</h6>
                ) : (
                    this.state.items.map(item => {
                        return (
                            <ListItem key={item.id} itemName={item.name} itemQty={item.quantity} claimedName={item.claimedBy} />
                        );
                    })
                )}
            </ListGroup> 
        );
    }

    toggleModal = (type) => {
        if (type) {
            this.setState({ modalType: type });
        }
        this.setState({ showModal: !this.state.showModal });
    }

    renderModal() {
        switch (this.state.modalType) {
            case "add":
                return (
                    <Modal show={this.state.showModal} onHide={this.toggleModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Add an Item</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <ListItemForm onSubmit={this.addNewItem} />
                        </Modal.Body>
                    </Modal>
                );
            default: 
                return;
        }
    }
    
    render() {
        return (
            <div>
                <Container>
                    <Row className="mb-3 justify-content-between">
                        <h2 className="m-0">My List</h2>
                        <Button className="ml-auto" name="editItemButton" onClick={() => console.log("Edit button clicked")}>Edit</Button>
                        <Button className="ml-2" name="addItemButton" onClick={() => this.toggleModal("add")}>Add</Button>
                    </Row>
                    <Row>
                        <Col className="p-0">
                           {this.renderItems()}
                        </Col>
                    </Row>
                </Container>
                {this.renderModal()}
            </div>
        );
    }
}



export default ListRoute;