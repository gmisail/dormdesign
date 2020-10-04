import React, { Component } from "react";
import { Container, Row, Col, ListGroup, Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";

import ListItem from "../components/ListItem/ListItem";
import ListItemForm from "../components/ListItemForm/ListItemForm";
import ListController from "../controllers/list.controller";

class ListRoute extends Component {
  constructor() {
    super();

    this.state = {
      items: [],
      showModal: false,
      modalType: "none",
      editingItem: undefined,
    };
  }

  componentDidMount() {
    ListController.getList((list) => {
      this.setState({ items: list });
    });
  }

  itemEditButtonClicked = (item) => {
    this.setState({ editingItem: item });
    this.toggleModal("edit");
  };

  saveEditedItem = () => {
    this.setState({ editingItem: undefined });
    this.toggleModal();
  };

  addNewItem = (item) => {
    ListController.addListItem(item, (list) => {
      this.setState({
        items: list,
      });
      this.toggleModal();
    });
  };

  renderItems() {
    return (
      <ListGroup>
        {!this.state.items.length ? (
          <h6>No items have been added yet</h6>
        ) : (
          this.state.items.map((item, index) => {
            return (
              <ListItem
                key={item.id}
                item={item}
                onEdit={this.itemEditButtonClicked}
              />
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
  };

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
      case "edit":
        return (
          <Modal show={this.state.showModal} onHide={this.toggleModal}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Item</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ListItemForm
                item={this.state.editingItem}
                onSubmit={this.saveEditedItem}
              />
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

            <Button
              className="ml-2"
              name="addItemButton"
              onClick={() => this.toggleModal("add")}
            >
              Add
            </Button>
          </Row>
          <Row>
            <Col className="p-0">{this.renderItems()}</Col>
          </Row>
        </Container>
        {this.renderModal()}
      </div>
    );
  }
}

export default ListRoute;
