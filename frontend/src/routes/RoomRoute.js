import React, { Component } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import RoomCanvas from "../components/RoomCanvas/RoomCanvas";
import DormItemList from "../components/DormItemList/DormItemList";
import ListItemForm from "../components/ListItemForm/ListItemForm";
import DataController from "../controllers/DataController";
import SocketConnection from "../controllers/SocketConnection";
import EventController from "../controllers/EventController";
import DormItem from "../models/DormItem";
import ChooseNameForm from "../components/ChooseNameForm/ChooseNameForm";

class RoomRoute extends Component {
  constructor() {
    super();

    this.state = {
      items: undefined,
      showModal: false,
      modalType: "none",
      editingItem: undefined,
      socketConnection: undefined,
    };
  }

  componentDidMount() {
    this.loadData();
    this.setupEventListeners();

    const name = window.localStorage.getItem("name");
    if (!name || name.length === 0) {
      this.toggleModal("choose-name");
    }
  }

  onSocketConnectionClosed = (message) => {
    console.warn("SOCKET CLOSED", message);

    /*
      TODO: Display some sort of error and try to reconnect
    */
  };

  loadData = async () => {
    const roomID = this.props.match.params.id;

    const connection = new SocketConnection(roomID);
    // When socket connection receives message, notify EventController
    connection.onMessage = (data) => {
      if (data.event) {
        EventController.emit(data.event, data.data);
      } else {
        console.warn("Socket message received with no event field: ", data);
      }
    };
    connection.onClose = this.onSocketConnectionClosed;
    this.setState({ socketConnection: connection });

    try {
      const items = await DataController.getList(roomID);
      this.setState({ items: items });
    } catch (err) {
      console.error(err);
    }
  };

  setupEventListeners = () => {
    EventController.on("itemAdded", (data) => {
      const item = new DormItem(data);

      this.setState({ items: [item, ...this.state.items] });
    });

    EventController.on("itemEdited", (data) => {
      const updated = data.updated;

      const oldItemArray = this.state.items;
      let itemArray = [];
      let updateIndex = undefined;
      for (let i = 0; i < oldItemArray.length; i++) {
        let item = oldItemArray[i];
        itemArray.push(item);
        if (item.id === data.id) {
          updateIndex = i;
        }
      }
      if (updateIndex === undefined) {
        console.error(
          "ERROR Updating item. Unable to find item with ID ",
          data.id
        );
      } else {
        if (Object.prototype.hasOwnProperty.call(updated, "editorPosition")) {
          itemArray[updateIndex].editorPosition = updated.editorPosition;
        }
        if (Object.prototype.hasOwnProperty.call(updated, "dimensions")) {
          itemArray[updateIndex].dimensions = updated.dimensions;
        }
        if (Object.prototype.hasOwnProperty.call(updated, "name")) {
          itemArray[updateIndex].name = updated.name;
        }
        if (Object.prototype.hasOwnProperty.call(updated, "claimedBy")) {
          itemArray[updateIndex].claimedBy = updated.claimedBy;
        }
        if (Object.prototype.hasOwnProperty.call(updated, "visibleInEditor")) {
          itemArray[updateIndex].visibleInEditor = updated.visibleInEditor;
        }
        if (Object.prototype.hasOwnProperty.call(updated, "quantity")) {
          itemArray[updateIndex].quantity = updated.quantity;
        }

        this.setState({ items: itemArray });
      }
    });
  };

  // Called when edit button is clicked for an item in the list
  editItem = (item) => {
    this.setState({ editingItem: item });
    this.toggleModal("edit");
  };

  claimItem = (item) => {
    const name = window.localStorage.getItem("name");

    if (!name || name.length === 0) {
      this.toggleModal("choose-name");
    } else {
      this.state.socketConnection.send({
        event: "editItem",
        respond: true,
        data: {
          itemID: item.id,
          updated: {
            claimedBy: window.localStorage.getItem("name"),
          },
        },
      });
    }
  };

  // Called when delete button is clicked for an item in the list
  deleteItem = (item) => {
    console.log("Delete button clicked for item: ", item);
  };

  // Receives item ID and list of modified properties when ListItemForm is submitted
  editItemFormSubmit = (itemID, modified) => {
    this.state.socketConnection.send({
      event: "editItem",
      respond: true,
      data: {
        itemID,
        updated: modified,
      },
    });

    this.toggleModal();
    this.setState({ editingItem: undefined });
  };

  editName = (name) => {
    window.localStorage.setItem("name", name);
    this.toggleModal();
  };

  // Receives item ID and list of modified properties when ListItemForm is submitted
  addNewItem = (itemID, modified) => {
    this.state.socketConnection.send({
      event: "addItem",
      data: modified,
    });

    this.toggleModal();
  };

  // Callback passed to RoomCanvas for when item is updated
  itemUpdatedInEditor = (item) => {
    this.state.socketConnection.send({
      event: "updateItemPosition",
      respond: false,
      data: {
        itemID: item.id,
        editorPosition: item.editorPosition,
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
                onSubmit={this.editItemFormSubmit}
              />
            </Modal.Body>
          </Modal>
        );
      case "choose-name":
        return (
          <Modal show={this.state.showModal} onHide={this.toggleModal}>
            <Modal.Header closeButton>
              <Modal.Title>Choose Your Name</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Before you can claim items, you must choose a name so that other
              users know who you are.
              <hr />
              <ChooseNameForm onSubmit={this.editName} />
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
              {this.state.items === undefined ? (
                <div className="text-center mt-5">
                  <Spinner animation="border" role="status">
                    <span className="sr-only">Loading...</span>
                  </Spinner>
                </div>
              ) : (
                <RoomCanvas
                  items={this.state.items}
                  onItemUpdate={this.itemUpdatedInEditor}
                />
              )}
            </Col>
            <Col lg={5}>
              {this.state.items === undefined ? (
                <div className="text-center mt-5">
                  <Spinner animation="border" role="status">
                    <span className="sr-only">Loading...</span>
                  </Spinner>
                </div>
              ) : (
                <DormItemList
                  items={this.state.items}
                  onEditItem={this.editItem}
                  onClaimItem={this.claimItem}
                  onDeleteItem={this.deleteItem}
                ></DormItemList>
              )}

              <Row className="justify-content-between align-items-center m-0 mt-3">
                <Button
                  name="addItemButton"
                  onClick={() => this.toggleModal("add")}
                >
                  Add Item
                </Button>
              </Row>
            </Col>
          </Row>
        </Container>
        {this.renderModal()}
      </>
    );
  }
}

export default RoomRoute;
