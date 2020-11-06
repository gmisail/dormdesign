import React, { Component } from "react";

import { Spinner } from "react-bootstrap";
import { BsPlus } from "react-icons/bs";

import RoomCanvas from "../../components/RoomCanvas/RoomCanvas";
import DormItemList from "../../components/DormItemList/DormItemList";

import RoomCanvas from "../../components/RoomCanvas/RoomCanvas";
import DormItemList from "../../components/DormItemList/DormItemList";

import DataController from "../../controllers/DataController";
import SocketConnection from "../../controllers/SocketConnection";
import EventController from "../../controllers/EventController";
import DormItem from "../../models/DormItem";

import AddModal from "../../components/modals/AddModal";
import EditModal from "../../components/modals/EditModal";
import NameModal from "../../components/modals/NameModal";

import "./RoomRoute.css";

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

    EventController.on("itemDeleted", (data) => {
      if (data.id === undefined) {
        console.error(
          "Received 'itemDeleted' event missing item id. Event data: ",
          data
        );
        return;
      }
      const itemArray = this.state.items.filter((item) => item.id !== data.id);

      this.setState({ items: itemArray });
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
        sendResponse: true,
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
    this.state.socketConnection.send({
      event: "deleteItem",
      sendResponse: true,
      data: {
        itemID: item.id,
      },
    });
  };

  // Receives item ID and list of modified properties when ListItemForm is submitted
  editItemFormSubmit = (itemID, modified) => {
    this.state.socketConnection.send({
      event: "editItem",
      sendResponse: true,
      data: {
        itemID: itemID,
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
      sendResponse: true,
      data: modified,
    });

    this.toggleModal();
  };

  // Callback passed to RoomCanvas for when item is updated
  itemUpdatedInEditor = (item) => {
    this.state.socketConnection.send({
      event: "updateItemPosition",
      sendResponse: false,
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
          <AddModal
            show={this.state.showModal}
            onHide={this.toggleModal}
            onSubmit={this.addNewItem}
          />
        );
      case "edit":
        return (
          <EditModal
            show={this.state.showModal}
            onHide={this.toggleModal}
            onSubmit={this.editItemFormSubmit}
            editingItem={this.state.editingItem}
          />
        );
      case "choose-name":
        return (
          <NameModal
            show={this.state.showModal}
            onHide={this.toggleModal}
            onSubmit={this.editName}
          />
        );
      default:
        return;
    }
  }

  renderRoom() {
    return (
      <>
        <div className="room-container">
          <h2 className="room-header">Dorm Name - Room #</h2>
          <div className="d-flex justify-content-center room-editor-container">
            <RoomCanvas
              items={this.state.items}
              onItemUpdate={this.itemUpdatedInEditor}
            />
          </div>
          <div className="room-item-list-container">
            <DormItemList
              items={this.state.items}
              onEditItem={this.editItem}
              onClaimItem={this.claimItem}
              onDeleteItem={this.deleteItem}
            ></DormItemList>
          </div>
        </div>

        <button
          className="fixed-add-button"
          name="addItemButton"
          onClick={() => this.toggleModal("add")}
        >
          <BsPlus></BsPlus>
          <span className="add-button-text">Add Item</span>
        </button>
      </>
    );
  }

  render() {
    return (
      <>
        {this.state.items === undefined ? (
          <div className="text-center mt-5">
            <Spinner animation="grow" role="status" variant="primary">
              <span className="sr-only">Loading...</span> ) :
            </Spinner>
          </div>
        ) : (
          this.renderRoom()
        )}

        {this.renderModal()}
      </>
    );
  }
}

export default RoomRoute;
