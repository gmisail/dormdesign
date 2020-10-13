import React, { Component } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import RoomCanvas from "../components/RoomCanvas/RoomCanvas";
import DormItemList from "../components/DormItemList/DormItemList";
import ListItemForm from "../components/ListItemForm/ListItemForm";
import DataController from "../controllers/DataController";

class RoomRoute extends Component {
  constructor() {
    super();

    this.state = {
      itemMap: undefined,
      editorData: undefined,
      showModal: false,
      modalType: "none",
      editingItemIndex: undefined,
    };

    this.addNewItem.bind(this);
    this.saveEditedItem.bind(this);
  }

  componentDidMount() {
    this.getItemMap();
    this.getEditorData();
  }

  getItemMap = async () => {
    const itemMap = await DataController.getItemMap();
    this.setState({ itemMap: itemMap });
  };

  getEditorData = async () => {
    const editorData = await DataController.GET_TEST_EDITOR_DATA();
    this.setState({ editorData: editorData });
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

    /* For testing, just add the item to the editor data locally. */
    if (newItem.includeInEditor) {
      this.state.editorData.objects.set(newItem.id, { position: undefined });
    }
    this.toggleModal();
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
              {this.state.editorData === undefined ? (
                <div className="text-center mt-5">
                  <Spinner animation="border" role="status">
                    <span className="sr-only">Loading...</span>
                  </Spinner>
                </div>
              ) : (
                <RoomCanvas
                  itemMap={this.state.itemMap}
                  editorData={this.state.editorData}
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