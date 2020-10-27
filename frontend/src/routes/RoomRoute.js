import React, { Component } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import RoomCanvas from "../components/RoomCanvas/RoomCanvas";
import DormItemList from "../components/DormItemList/DormItemList";
import ListItemForm from "../components/ListItemForm/ListItemForm";
import DataController from "../controllers/DataController";
import SocketConnection from "../controllers/SocketConnection";

class RoomRoute extends Component {
  constructor() {
    super();

    this.state = {
      itemMap: undefined,
      showModal: false,
      modalType: "none",
      editingItemIndex: undefined,
      socketConnection: undefined,
    };
  }

  componentDidMount() {
    this.getItemMap();
  }

  onReceiveSocketMessage = (data) => {
    console.log("RECEIVED", data);
  };

  onSocketConnectionClosed = (message) => {
    console.log("SOCKET CLOSED", message);
  };

  getItemMap = async () => {
    // const listID = await DataController.CREATE_TEST_LIST();
    const roomID = this.props.match.params.id;
    console.log("ROOM ID", roomID);

    const connection = new SocketConnection(roomID);
    connection.onMessage = this.onReceiveSocketMessage;
    connection.onClose = this.onSocketConnectionClosed;

    this.setState({ socketConnection: connection });
    const itemMap = await DataController.getList(roomID);
    this.setState({ itemMap: itemMap });
  };

  editItem = (item) => {
    this.setState({ editingItem: item });
    this.toggleModal("edit");
  };

  saveEditedItem = async () => {
    const item = this.state.editingItem;
    const editedItem = await DataController.editListItem(item);
    this.state.itemMap.set(item.id, editedItem);
    this.setState({ editingItem: undefined });
    this.toggleModal();
  };

  addNewItem = async (item) => {
    let newItem = await DataController.addListItem(item);
    this.state.itemMap.set(newItem.id, newItem);

    this.toggleModal();
  };

  // Callback passed to RoomCanvas for when item is updated
  itemUpdatedInEditor = (item) => {
    // console.log("ITEM", item.id, item, "UPDATED");
    this.state.socketConnection.send({
      event: "itemUpdated",
      data: {
        itemID: item.id,
        updated: {
          editorPosition: item.editorPosition,
        },
      },
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
              <ListItemForm onSubmit={this.addNewItem.bind(this)} />
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
            <Col xs={12} lg={7} className="mb-3">
              {this.state.itemMap === undefined ? (
                <div className="text-center mt-5">
                  <Spinner animation="border" role="status">
                    <span className="sr-only">Loading...</span>
                  </Spinner>
                </div>
              ) : (
                <RoomCanvas
                  itemMap={this.state.itemMap}
                  onItemUpdate={this.itemUpdatedInEditor}
                />
              )}
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

              {this.state.itemMap === undefined ? (
                <div className="text-center mt-5">
                  <Spinner animation="border" role="status">
                    <span className="sr-only">Loading...</span>
                  </Spinner>
                </div>
              ) : (
                <DormItemList
                  items={[...this.state.itemMap.values()]}
                  onEditItem={this.editItem}
                ></DormItemList>
              )}
            </Col>
          </Row>
        </Container>
        {this.renderModal()}
      </>
    );
  }
}

export default RoomRoute;
