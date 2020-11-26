import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import { RoomContext } from "./RoomContext";

import { Spinner, Alert } from "react-bootstrap";
import { BsPlus } from "react-icons/bs";

import RoomEditor from "../../components/RoomEditor/RoomEditor";
import DormItemList from "../../components/DormItemList/DormItemList";

import DormItem from "../../models/DormItem";

import AddModal from "../../components/modals/AddModal";
import EditModal from "../../components/modals/EditModal";
import NameModal from "../../components/modals/NameModal";

import ErrorModal from "../../components/modals/ErrorModal";

import "./RoomRoute.scss";

const modalTypes = {
  add: "ADD",
  edit: "EDIT",
  chooseName: "CHOOSE_NAME",
  error: "ERROR",
};

// Modal component that returns a modal based on the passed 'type' prop and passes all props to that modal
const Modal = (props) => {
  switch (props.type) {
    case modalTypes.add:
      return <AddModal {...props} />;
    case modalTypes.edit:
      return <EditModal {...props} />;
    case modalTypes.chooseName:
      return <NameModal {...props} />;
    case modalTypes.error:
      return <ErrorModal {...props}></ErrorModal>;
    default:
      return null;
  }
};

/*
  Keeps track of modal props. Returns current modalProps and toggleModal function
  which takes (type, data) parameters, type is the modal type that should be 
  displayed and data is additional props that should be passed to the modal.

  Calling toggleModal() with no parameters resets the modalProps so the current
  modal will be hidden.
*/

const initialModalState = {
  show: false,
  type: null,
};

const useModal = () => {
  const [modalProps, setModalProps] = useState(initialModalState);
  const toggleModal = useCallback((type, props) => {
    if (type !== undefined) {
      // console.log("TYPE TOGGLE");
      setModalProps({
        ...initialModalState,
        ...props,
        show: true,
        type: type,
        onHide: () => toggleModal(),
      });
    } else {
      /* 
        When toggling the modal off, we don't want to reset the type variable
        since we still want that modal to be rendered (so the Bootstrap modal hide animation has time to be shown)
      */
      setModalProps((prevState) => ({
        ...initialModalState,
        type: prevState.type,
        onHide: () => toggleModal(),
      }));
    }
  }, []);

  return [modalProps, toggleModal];
};

export const RoomRouteNew = () => {
  const {
    items,
    loading,
    error,
    userName,
    connectToRoom,
    setUserName,
    addItem,
    updateItems,
    deleteItem,
    selectedItemID,
  } = useContext(RoomContext);
  const { id } = useParams();
  const [modalProps, toggleModal] = useModal();

  // Called when component is first mounted
  useEffect(() => {
    console.log("CONNECTING TO ROOM");
    connectToRoom(id);
  }, [connectToRoom, id]);

  /* Presents choose name modal if userName is null */
  useEffect(() => {
    if (!loading && userName === null) {
      toggleModal(modalTypes.chooseName, {
        onSubmit: (newName) => {
          setUserName(newName);
          toggleModal();
        },
      });
    }
  }, [loading, userName, setUserName, toggleModal]);

  const onClickAddItemButton = useCallback(
    () =>
      toggleModal(modalTypes.add, {
        // Form passes item id and the updated properties/values. We can ignore the id since this a new item
        onSubmit: (_, properties) => {
          addItem(properties);
          toggleModal();
        },
      }),
    [addItem, toggleModal]
  );

  const onClickEditItemButton = useCallback(
    (item) =>
      toggleModal(modalTypes.edit, {
        editingItem: item,
        onSubmit: (id, updated) => {
          updateItems([{ id, updated }]);
          toggleModal();
        },
      }),
    [updateItems, toggleModal]
  );

  const onClickClaimItemButton = useCallback(
    (item) =>
      updateItems([
        {
          id: item.id,
          updated: { claimedBy: item.claimedBy === userName ? null : userName },
        },
      ]),
    [updateItems, userName]
  );

  const onToggleItemEditorVisibility = useCallback(
    (item) =>
      updateItems([
        {
          id: item.id,
          updated: { visibleInEditor: !item.visibleInEditor },
        },
      ]),
    [updateItems]
  );

  return (
    <>
      <div className="room-container">
        {/* {this.state.showAlert ? (
          <Alert
            className="room-alert"
            variant={this.state.alertVariant}
            onClose={() => this.setState({ showAlert: false })}
            dismissible
          >
            {this.state.alertMessage}
          </Alert>
        ) : null} */}
        <h2 className="room-header">Dorm Name - Room #</h2>
        <div className="room-editor-container custom-card">
          <RoomEditor />
        </div>
        <div className="room-item-list-container">
          <button
            className="custom-btn add-item-button"
            name="addItemButton"
            onClick={onClickAddItemButton}
          >
            <BsPlus />
            <span className="add-item-button-text">Add Item</span>
          </button>
          <DormItemList
            items={items}
            selectedItemID={selectedItemID}
            onEditItem={onClickEditItemButton}
            onClaimItem={onClickClaimItemButton}
            onDeleteItem={deleteItem}
            onToggleEditorVisibility={onToggleItemEditorVisibility}
          ></DormItemList>
        </div>
      </div>
      <Modal {...modalProps}></Modal>
    </>
  );
};
