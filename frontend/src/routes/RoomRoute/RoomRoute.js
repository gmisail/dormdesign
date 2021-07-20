import "./RoomRoute.scss";

import { BsBoxArrowUpRight, BsGear, BsPencil, BsPlus } from "react-icons/bs";
import { Modal, modalTypes } from "../../components/modals/Modal";
import React, { useCallback, useEffect } from "react";
import {
  addItem,
  cloneRoom,
  connectToRoom,
  deleteItem,
  setUserName,
  updateItems,
  updateRoomName,
} from "../../context/RoomStore";
import { useDispatch, useSelector } from "react-redux";

import ActiveUsersIndicator from "../../components/ActiveUsersIndicator/ActiveUsersIndicator";
import DormItemList from "../../components/DormItemList/DormItemList";
import IconButton from "../../components/IconButton/IconButton";
import RoomEditor from "../../components/RoomEditor/RoomEditor";
import { Spinner } from "react-bootstrap";
import useModal from "../../hooks/useModal";
import { useParams } from "react-router-dom";

export const RoomRoute = () => {
  const socketConnection = useSelector((state) => state.socketConnection);
  const roomName = useSelector((state) => state.roomName);
  const templateId = useSelector((state) => state.templateId);
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);
  const userName = useSelector((state) => state.userName);
  const userNames = useSelector((state) => state.userNames);

  const { id } = useParams();
  const [modalProps, toggleModal] = useModal();
  const dispatch = useDispatch();

  // Called when component is first mounted
  useEffect(() => {
    dispatch(connectToRoom(id));
  }, [connectToRoom, id, dispatch]);

  /* Presents choose name modal if userName is null */
  useEffect(() => {
    // Only present if actually connected to room (since name might be null otherwise)
    if (userName === null && socketConnection !== null) {
      toggleModal(modalTypes.chooseName, {
        onSubmit: (newName) => {
          dispatch(setUserName(newName));
          toggleModal();
        },
      });
    } else if (userName !== null && socketConnection !== null) {
      // if a username exists, update it on the server
      setUserName(userName);
    }
  }, [loading, userName, setUserName, toggleModal, socketConnection, dispatch]);

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
          dispatch(addItem(properties));
          toggleModal();
        },
      }),
    [addItem, toggleModal, dispatch]
  );

  const onClickEditItemButton = useCallback(
    (item) =>
      toggleModal(modalTypes.edit, {
        editingItem: item,
        onSubmit: (id, updated) => {
          if (Object.keys(updated).length > 0) {
            dispatch(updateItems([{ id, updated }]));
          }
          toggleModal();
        },
      }),
    [updateItems, toggleModal, dispatch]
  );

  const onClickDuplicateItemButton = useCallback(
    (item) => dispatch(addItem(item)),
    [addItem, dispatch]
  );

  const onClickClaimItemButton = useCallback(
    (item) =>
      dispatch(
        updateItems([
          {
            id: item.id,
            updated: {
              claimedBy: item.claimedBy === userName ? null : userName,
            },
          },
        ])
      ),
    [updateItems, userName, dispatch]
  );

  const onClickSettingsButton = useCallback(
    () =>
      toggleModal(modalTypes.settings, {
        onClone: (target) => {
          dispatch(cloneRoom(id, target));
        },
        userName: userName,
        onChangeUserName: (name) => {
          dispatch(setUserName(name));
        },
        roomName: roomName,
        onChangeRoomName: (name) => {
          dispatch(updateRoomName(id, name));
        },
        onDeleteRoom: () => {
          dispatch(deleteRoom(id));
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
      dispatch,
    ]
  );

  const onClickRoomName = useCallback(
    () =>
      toggleModal(modalTypes.updateRoomName, {
        name: roomName,
        onSubmit: (updatedRoomName) => {
          if (updatedRoomName !== roomName) {
            // Only update if name actually changed
            dispatch(updateRoomName(id, updatedRoomName));
          }
          toggleModal();
        },
        onHide: () => toggleModal(),
      }),
    [toggleModal, updateRoomName, roomName, id, dispatch]
  );

  const onToggleItemEditorVisibility = useCallback(
    (item) =>
      dispatch(
        updateItems([
          {
            id: item.id,
            updated: { visibleInEditor: !item.visibleInEditor },
          },
        ])
      ),
    [updateItems, dispatch]
  );

  /* 
    If there's an error and socketConnection has been reset, connection has been 
    lost. 

    If that's true and there are no items, then then the original room data fetch failed

    TODO: Implement actual error types to make it easier to check what error 
    happened
  */
  const lostConnection = error !== null && socketConnection === null;
  const dataFetchError = lostConnection; //lostConnection && items === null;

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
