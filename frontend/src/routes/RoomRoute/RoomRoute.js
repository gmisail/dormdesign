import "./RoomRoute.scss";

import { BsGear, BsPencil, BsPlus, BsLink45Deg } from "react-icons/bs";
import { Modal, modalTypes } from "../../components/modals/Modal";
import React, { useCallback, useEffect } from "react";
import {
  addItem,
  cloneRoom,
  connectToRoom,
  deleteItem,
  deleteRoom,
  setUserName,
  updateItems,
  updateRoomName,
} from "../../context/RoomStore";
import { connect, useDispatch, useSelector } from "react-redux";

import ActiveUsersIndicator from "./ActiveUsersIndicator/ActiveUsersIndicator";
import DormItemList from "../../components/DormItemList/DormItemList";
import IconButton from "../../components/IconButton/IconButton";
import RoomEditor from "./RoomEditor/RoomEditor";
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

  const { id } = useParams();
  const [modalProps, toggleModal] = useModal();
  const dispatch = useDispatch();

  // Called when component is first mounted
  useEffect(() => {
    console.log("Connecting to Room...");
    dispatch(connectToRoom(id));
  }, [connectToRoom, id, dispatch]);

  useEffect(() => {
    if (socketConnection) {
      return () => {
        console.log("RoomRoute unmounted. Closing Socket connection");
        socketConnection.connection.close();
      };
    }
  }, [socketConnection]);

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
      dispatch(setUserName(userName));
    }
  }, [loading, userName, setUserName, toggleModal, socketConnection, dispatch]);

  useEffect(() => {
    if (error !== null) {
      toggleModal(modalTypes.error, {
        message: error,
      });
    }
  }, [error, toggleModal]);

  useEffect(() => {
    document.title = `Room ${roomName ? "| " + roomName : ""}`;
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

  const onClickDuplicateItemButton = useCallback((item) => dispatch(addItem(item)), [
    addItem,
    dispatch,
  ]);

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
    [toggleModal, cloneRoom, id, userName, setUserName, roomName, updateRoomName, dispatch]
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
    TODO: Implement actual error types to make it easier to check what error 
    happened
  */
  const lostConnection = error !== null && socketConnection === null;

  return (
    <>
      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="grow" role="status" variant="primary">
            <span className="sr-only">Loading...</span> ) :
          </Spinner>
        </div>
      ) : lostConnection ? (
        <p className="text-center mt-5" style={{ fontSize: 20, fontWeight: 500 }}>
          Failed to connect to the room. Make sure the link is valid and try refreshing the page.
        </p>
      ) : (
        <div className="room-container">
          <div className="room-header">
            <div title={roomName} className="room-name-container">
              <h2 onClick={onClickRoomName} className="room-name">
                {roomName}
              </h2>
              <BsPencil className="room-name-edit-icon" />
            </div>

            <div className="room-header-buttons">
              <ActiveUsersIndicator />
              <IconButton
                title="Share"
                circleSelectionEffect={true}
                toggled={modalProps.show && modalProps.type === modalTypes.share}
                onClick={() => {
                  toggleModal(modalTypes.shareRoom, {
                    id: id,
                    templateId: templateId,
                  });
                }}
              >
                <BsLink45Deg />
              </IconButton>
              <IconButton
                title="Settings"
                className="circle-hover"
                circleSelectionEffect
                toggled={modalProps.show && modalProps.type === modalTypes.settings}
                onClick={onClickSettingsButton}
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
              onDeleteItem={(item) => dispatch(deleteItem(item))}
              onToggleEditorVisibility={onToggleItemEditorVisibility}
            ></DormItemList>
          </div>
        </div>
      )}
      <Modal {...modalProps}></Modal>
    </>
  );
};
