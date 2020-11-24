import React, { Component } from "react";

import { Spinner, Alert, Button, Row, Col } from "react-bootstrap";
import { BsGear, BsPlus } from "react-icons/bs";

import RoomCanvas from "../../components/RoomCanvas/RoomCanvas";
import DormItemList from "../../components/DormItemList/DormItemList";

import DataController from "../../controllers/DataController";
import SocketConnection from "../../controllers/SocketConnection";
import EventController from "../../controllers/EventController";
import DormItem from "../../models/DormItem";

import AddModal from "../../components/modals/AddModal";
import EditModal from "../../components/modals/EditModal";
import NameModal from "../../components/modals/NameModal";
import SettingsModal from "../../components/modals/SettingsModal";

import "./RoomRoute.css";
import ErrorModal from "../../components/modals/ErrorModal";
import IconButton from "../../components/IconButton/IconButton";

class RoomRoute extends Component {
  constructor() {
    super();

    this.state = {
      items: [],
      showModal: false,
      modalType: "none",
      editingItem: undefined,
      errorMessage: "Something happened",
      selectedItemID: undefined,
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
    this.socketConnection = connection;

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

    EventController.on("itemUpdated", (data) => {
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
          `ERROR Updating item. Unable to find item with ID ${data.id} given data ${data}`
        );
      } else {
        itemArray[updateIndex].update(updated);

        this.setState({ items: itemArray });
      }
    });

    // Received when an event sent from this client failed on the server
    EventController.on("actionFailed", (data) => {
      const action = data.action;
      if (action === undefined) {
        console.error(
          "Received 'actionFailed' event with missing 'action' field in data"
        );
        return;
      }
      switch (action) {
        case "addItem":
          console.error("Error adding item.", data.message);
          this.setState({
            showModal: true,
            modalType: "error",
            errorMessage: "Failed to create a new item. Try again later.",
          });
          break;
        case "deleteItem":
          console.error("Error deleting item.", data.message);
          this.setState({
            showModal: true,
            modalType: "error",
            errorMessage: "Failed to delete item. Try again later.",
          });
          break;
        case "updateItemPosition":
          console.error("Error updating item position.", data.message);
          this.setState({
            showModal: true,
            modalType: "error",
            errorMessage: "Failed to update item in editor. Try again later.",
          });
          break;
        case "editItem":
          console.error("Error editing item.", data.message);
          this.setState({
            showModal: true,
            modalType: "error",
            errorMessage: "Failed to edit item properties. Try again later.",
          });
          break;
        default:
          console.error("Unknown socket event error.", data);
      }
    });
  };

  // Called when ChooseNameForm is submitted
  editName = (name) => {
    window.localStorage.setItem("name", name);
    this.toggleModal();
  };

  // Called when edit button is clicked for an item in the list
  showEditForm = (item) => {
    this.setState({ editingItem: item });
    this.toggleModal("edit");
  };

  // Called when claim button is clicked for an item in the list
  claimItem = (item) => {
    const name = window.localStorage.getItem("name");

    if (!name || name.length === 0) {
      this.toggleModal("choose-name");
    } else {
      this.socketConnection.send({
        event: "updateItem",
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

  // Passed to RoomCanvas and called when an item is selected in the editor
  itemSelectedInEditor = (item) => {
    this.setState({ selectedItemID: item?.id });
  };

  // Passed to RoomCanvas and called when an item is updated (e.g. moved, rotated, locked) in the editor
  itemUpdatedInEditor = (item, updated) => {
    item.update(updated);
    this.socketConnection.send({
      event: "updateItem",
      sendResponse: false,
      data: {
        itemID: item.id,
        updated: updated,
      },
    });
  };

  // Called when show/hide from editor is clicked for an item in the list
  toggleEditorVisibility = (item) => {
    this.socketConnection.send({
      event: "updateItem",
      sendResponse: true,
      data: {
        itemID: item.id,
        updated: {
          visibleInEditor: !item.visibleInEditor,
        },
      },
    });
  };

  // Called when delete button is clicked for an item in the list
  deleteItem = (item) => {
    this.socketConnection.send({
      event: "deleteItem",
      sendResponse: true,
      data: {
        itemID: item.id,
      },
    });
  };

  // Takes in item ID and dictionary of modified properties
  editItem = (itemID, modified) => {
    this.socketConnection.send({
      event: "updateItem",
      sendResponse: true,
      data: {
        itemID: itemID,
        updated: modified,
      },
    });

    this.toggleModal();
    this.setState({ editingItem: undefined });
  };

  // Receives item ID and list of modified properties when ListItemForm is submitted
  addNewItem = (_, modified) => {
    this.socketConnection.send({
      event: "addItem",
      sendResponse: true,
      data: modified,
    });

    this.toggleModal();
  };

  toggleModal = (type) => {
    if (type) {
      this.setState({ modalType: type });
    }
    this.setState({ showModal: !this.state.showModal });
  };

  exportRoomData = () => {
    const id = this.props.match.params.id;
    DataController.downloadRoom(id);
  };

  importRoomData = (file) => {
    const id = this.props.match.params.id;
    DataController.uploadRoom(id, file);
  };

  updateLayout = (verts) => {
    this.socketConnection.send({
      event: "updateLayout",
      sendResponse: false, // false until we complete the response
      data: {
        vertices: verts,
      },
    });

    EventController.emit("layoutUpdated", {
      vertices: verts,
    });
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
            onSubmit={this.editItem}
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
      case "error":
        return (
          <ErrorModal
            show={this.state.showModal}
            onHide={this.toggleModal}
            message={this.state.errorMessage}
          ></ErrorModal>
        );
      case "settings":
        return (
          <SettingsModal
            show={this.state.showModal}
            onHide={this.toggleModal}
            onExport={this.exportRoomData}
            onImport={this.importRoomData}
            onUpdateLayout={this.updateLayout}
            message={this.state.errorMessage}
          ></SettingsModal>
        );
      default:
        return;
    }
  }

  renderRoom() {
    return (
      <>
        <div className="room-container">
          {this.state.showAlert ? (
            <Alert
              className="room-alert"
              variant={this.state.alertVariant}
              onClose={() => this.setState({ showAlert: false })}
              dismissible
            >
              {this.state.alertMessage}
            </Alert>
          ) : null}

          <div className="d-flex justify-content-start room-header">
            <h2>Dorm Name - Room #</h2>
          </div>

          <div className="d-flex justify-content-end room-header">
            <IconButton onClick={() => this.toggleModal("settings")}>
              <BsGear></BsGear>
            </IconButton>
          </div>

          <div className="d-flex justify-content-center room-editor-container">
            <RoomCanvas
              items={this.state.items}
              selectedItemID={this.state.selectedItemID}
              onItemSelected={this.itemSelectedInEditor}
              onItemUpdated={this.itemUpdatedInEditor}
            />
          </div>
          <div className="room-item-list-container">
            <DormItemList
              items={this.state.items}
              onEditItem={this.showEditForm}
              onClaimItem={this.claimItem}
              onDeleteItem={this.deleteItem}
              onToggleEditorVisibility={this.toggleEditorVisibility}
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
