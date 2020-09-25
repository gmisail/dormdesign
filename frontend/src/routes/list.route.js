import React, { Component } from "react";
import { Container, Row, Col, ListGroup, Button } from "react-bootstrap";
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import ListItem from "../components/ListItem/ListItem";

const TEST_ITEMS = [
    {
        name: "Fridge",
        claimedBy: undefined,
    },
    {
        name: "Soundbar",
        claimedBy: "John Smith",
    },
    {
        name: "Microwave",
        claimedBy: undefined,
    },
]

class ListRoute extends Component {
    state = { 
        showModal: false,
        items: [],
        addItemNameValue: "New Item"
    };

    toggleModal = () => {
        this.setState({ addItemNameValue: "New Item"});
        this.setState({ showModal: !this.state.showModal });
    }

    handleInputChange = event => {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        
        this.setState({
            [name]: value
        });
    }
    
    render() {
        return (
            <>
                <Container>
                    <Row className="mb-3 justify-content-between">
                        <h2 className="m-0">My List</h2>
                        <Button onClick={this.toggleModal}>Add Item</Button>
                    </Row>
                    <Row>
                        <Col className="p-0">
                            <ListGroup>
                                <ListItem itemName="Soundbar" itemQty={1} />
                                <ListItem itemName="Floor lamp" claimedName="John Smith" />
                                <ListItem itemName="LED Strips" itemQty={4} />
                            </ListGroup> 
                        </Col>
                    </Row>
                </Container>
                <Modal show={this.state.showModal} onHide={this.toggleModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Modal heading</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="formItemName">
                                <Form.Label>Item Name</Form.Label>
                                <Form.Control name="addItemNameValue" value={this.state.addItemNameValue} placeholder="Enter Item Name" onChange={this.handleInputChange} />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={this.toggleModal}>
                            Add
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
            
           
        );
    }
}



export default ListRoute;