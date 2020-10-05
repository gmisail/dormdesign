import React, { Component } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import RoomCanvas from "../components/RoomCanvas/RoomCanvas";
import DormItemList from "../components/DormItemList/DormItemList";
import ListItemForm from "../components/ListItemForm/ListItemForm";
import ListController from "../controllers/list.controller";

class RoomRoute extends Component {
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

  editItem = (item) => {
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
      <>
        <Container fluid className="px-3 pr-xl-5 pl-xl-5 room-container">
          <Row className="p-3 align-items-center">
            <h2 className="m-0">Dorm Name - Room #</h2>
          </Row>
          <Row className="mt-auto">
            <Col xs={12} lg={7}>
              <RoomCanvas
                items={this.state.items.filter((item) => {
                  return item.editor.included;
                })}
              />
            </Col>
            <Col lg={5}>
              <Row className="justify-content-between align-items-center m-0 mb-3">
                <h5>Dorm Items</h5>
                <Button
                  name="addItemButton"
                  onClick={() => this.toggleModal("add")}
                >
                  Add Item
                </Button>
              </Row>

              <DormItemList
                items={this.state.items}
                onEditItem={this.editItem}
              ></DormItemList>
            </Col>
          </Row>
        </Container>
        {this.renderModal()}
      </>
    );
  }
}

export default RoomRoute;
