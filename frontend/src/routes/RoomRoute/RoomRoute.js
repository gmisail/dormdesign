import "./RoomRoute.scss";

import { BsBoxArrowUpRight, BsGear, BsPencil, BsPlus } from "react-icons/bs";
import { Modal, modalTypes } from "../../components/modals/Modal";
import React, { useCallback, useContext, useEffect } from "react";

import ActiveUsersIndicator from "../../components/ActiveUsersIndicator/ActiveUsersIndicator";
import DormItemList from "../../components/DormItemList/DormItemList";
import IconButton from "../../components/IconButton/IconButton";
import { RoomContext } from "../../context/RoomContext";
import RoomEditor from "../../components/RoomEditor/RoomEditor";
import { Spinner } from "react-bootstrap";
import useModal from "../../hooks/useModal";
import { useParams } from "react-router-dom";

export const RoomRoute = () => {
  const {
    roomName,
    templateId,
    items,
    loading,
    error,
    socketConnection,
    userName,
    userNames,
    connectToRoom,
    updateRoomName,
    cloneRoom,
    setUserName,
    addItem,
    updateItems,
    deleteItem,
    deleteRoom,
    selectedItemID,
  } = useContext(RoomContext);

  const { id } = useParams();
  const [modalProps, toggleModal] = useModal();

  // Called when component is first mounted
  useEffect(() => {
    connectToRoom(id);
  }, [connectToRoom, id]);

  /* Presents choose name modal if userName is null */
  useEffect(() => {
    // Only present if actually connected to room (since name might be null otherwise)
    if (userName === null && socketConnection !== null) {
      toggleModal(modalTypes.chooseName, {
        onSubmit: (newName) => {
          setUserName(newName);
          toggleModal();
        },
      });
    } else if (userName !== null && socketConnection !== null) {
      // if a username exists, update it on the server
      setUserName(userName);
    }
  }, [loading, userName, setUserName, toggleModal, socketConnection]);

  useEffect(() => {
    /* There's an error. Only display modal if still connected to room (since there's a different case for that handled below) */
    if (error !== null && socketConnection !== null) {
      toggleModal(modalTypes.error, {
        message: error.message,
      });
    }
  }, [error, socketConnection, toggleModal]);

  useEffect(() => {
    document.title = `DormDesign ${roomName ? "| " + roomName : ""}`;
  }, [roomName]);

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
          if (Object.keys(updated).length > 0) {
            updateItems([{ id, updated }]);
          }
          toggleModal();
        },
      }),
    [updateItems, toggleModal]
  );

  const onClickDuplicateItemButton = useCallback((item) => addItem(item), [
    addItem,
  ]);

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

  const onClickSettingsButton = useCallback(
    () =>
      toggleModal(modalTypes.settings, {
        onClone: (target) => {
          cloneRoom(id, target);
        },
        userName: userName,
        onChangeUserName: (name) => {
          setUserName(name);
        },
        roomName: roomName,
        onChangeRoomName: (name) => {
          updateRoomName(id, name);
        },
        onDeleteRoom: () => {
          deleteRoom(id);
        },
      }),
    [
      toggleModal,
      cloneRoom,
      id,
      userName,
      setUserName,
      roomName,
      updateRoomName,
    ]
  );

  const onClickRoomName = useCallback(
    () =>
      toggleModal(modalTypes.updateRoomName, {
        name: roomName,
        onSubmit: (updatedRoomName) => {
          // Only update if name actually changed
          if (updatedRoomName !== roomName) {
            updateRoomName(id, updatedRoomName);
          }
          toggleModal();
        },
        onHide: () => toggleModal(),
      }),
    [toggleModal, updateRoomName, roomName, id]
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

  /* 
    If there's an error and socketConnection has been reset, connection has been 
    lost. 

    If that's true and there are no items, then then the original room data fetch failed

    TODO: Implement actual error types to make it easier to check what error 
    happened
  */
  const lostConnection = error !== null && socketConnection === null;
  const dataFetchError =
    error !== null && socketConnection === null && items === null;
  return (
    <>
      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="grow" role="status" variant="primary">
            <span className="sr-only">Loading...</span> ) :
          </Spinner>
        </div>
      ) : lostConnection || dataFetchError ? (
        <p
          className="text-center mt-5"
          style={{ fontSize: 20, fontWeight: 500 }}
        >
          {dataFetchError
            ? "Error fetching room data. Make sure the room ID is valid."
            : "Lost connection to room. Please refresh your browser."}
        </p>
      ) : (
        <div className="room-container">
          <div className="room-header">
            <div className="room-name-container">
              <h2 onClick={onClickRoomName} className="room-name">
                {roomName}
              </h2>
              <BsPencil className="room-name-edit-icon" />
            </div>

            <div className="room-header-buttons">
              <ActiveUsersIndicator usernames={userNames} maxUsernames={3} />
              <IconButton
                onClick={() => {
                  toggleModal(modalTypes.share, {
                    id: id,
                    templateId: templateId,
                    link: window.location.href,
                  });
                }}
              >
                <BsBoxArrowUpRight />
              </IconButton>
              <IconButton
                onClick={onClickSettingsButton}
                style={{ fontSize: "0.97em" }}
              >
                <BsGear />
              </IconButton>
            </div>
          </div>

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
              onDuplicateItem={onClickDuplicateItemButton}
              onClaimItem={onClickClaimItemButton}
              onDeleteItem={deleteItem}
              onToggleEditorVisibility={onToggleItemEditorVisibility}
            ></DormItemList>
          </div>
        </div>
      )}
      <Modal {...modalProps}></Modal>
    </>
  );
};
