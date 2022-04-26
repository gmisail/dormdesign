import "./TemplateRoute.scss";
import "../RoomRoute/RoomRoute.scss";

import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router";

import { connectToTemplate } from "../../context/RoomStore";
import { connect, useDispatch, useSelector } from "react-redux";

import { BsLink45Deg } from "react-icons/bs";
import { FaRegClone } from "react-icons/fa";
import { BiDuplicate } from "react-icons/bi";

import { Modal, modalTypes } from "../../components/modals/Modal";
import DormItemList from "../../components/DormItemList/DormItemList";
import IconButton from "../../components/IconButton/IconButton";
import TemplateEditor from "./TemplateEditor/TemplateEditor";
import { Spinner } from "react-bootstrap";
import useModal from "../../hooks/useModal";
import DataRequests from "../../controllers/DataRequests";

export const TemplateRoute = () => {
  const roomName = useSelector((state) => state.roomName);
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);

  const { id } = useParams();
  const [modalProps, toggleModal] = useModal();
  const dispatch = useDispatch();

  const history = useHistory();

  // Called when component is first mounted
  useEffect(() => {
    dispatch(connectToTemplate(id));
  }, [connectToTemplate, id, dispatch]);

  useEffect(() => {
    /* There's an error. Only display modal if still connected to room (since there's a different case for that handled below) */
    if (error !== null) {
      toggleModal(modalTypes.error, {
        message: error,
      });
    }
  }, [error, toggleModal]);

  useEffect(() => {
    document.title = `Template ${roomName ? "| " + roomName : ""}`;
  }, [roomName]);

  const onSubmitCloneModal = async (name) => {
    toggleModal();
    try {
      const roomData = await DataRequests.createRoom(name, id);
      history.push(`/room/${roomData.id}`);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <>
      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="grow" role="status" variant="primary">
            <span className="sr-only">Loading...</span> ) :
          </Spinner>
        </div>
      ) : error !== null ? (
        <p className="text-center mt-5" style={{ fontSize: 20, fontWeight: 500 }}>
          Failed to fetch template. Make sure the link is valid and try refreshing the page.
        </p>
      ) : (
        <div className="room-container">
          <div className="room-header">
            <div title={roomName} className="room-name-container template-name-container">
              <h2 className="room-name">{roomName}</h2>
              <p className="template-name-addon">(Template)</p>
            </div>

            <div className="room-header-buttons">
              <IconButton
                title="Share"
                circleSelectionEffect={true}
                toggled={modalProps.show && modalProps.type === modalTypes.share}
                onClick={() => {
                  toggleModal(modalTypes.shareTemplate, {
                    id: id,
                    link: window.location.href,
                  });
                }}
              >
                <BsLink45Deg />
              </IconButton>
              <button
                title="Clone Template"
                className="custom-btn template-clone-btn"
                onClick={() => {
                  toggleModal(modalTypes.cloneTemplate, {
                    onSubmit: onSubmitCloneModal,
                    templateName: roomName,
                  });
                }}
              >
                <BiDuplicate />
                <span className="">Clone</span>
              </button>
            </div>
          </div>

          <div className="room-editor-container custom-card">
            <TemplateEditor />
          </div>

          <div className="room-item-list-container">
            <DormItemList readOnly />
          </div>
        </div>
      )}
      <Modal {...modalProps}></Modal>
    </>
  );
};
