import React from "react";

import AddModal from "../../components/modals/AddModal";
import EditModal from "../../components/modals/EditModal";
import NameModal from "../../components/modals/NameModal";
import SettingsModal from "../../components/modals/SettingsModal";
import ShareRoomModal from "../../components/modals/ShareRoomModal/ShareRoomModal";
import ErrorModal from "../../components/modals/ErrorModal";
import RoomNameModal from "../../components/modals/RoomNameModal";

export const modalTypes = {
  add: "ADD",
  edit: "EDIT",
  chooseName: "CHOOSE_NAME",
  updateRoomName: "UPDATE_ROOM_NAME",
  error: "ERROR",
  settings: "SETTINGS",
  share: "SHARE",
};

// Modal component that returns a modal based on the passed 'type' prop and passes all props to that modal
export const Modal = (props) => {
  switch (props.type) {
    case modalTypes.add:
      return <AddModal {...props} />;
    case modalTypes.edit:
      return <EditModal {...props} />;
    case modalTypes.chooseName:
      return <NameModal {...props} />;
    case modalTypes.updateRoomName:
      return <RoomNameModal {...props} />;
    case modalTypes.error:
      return <ErrorModal {...props} />;
    case modalTypes.settings:
      return <SettingsModal {...props} />;
    case modalTypes.share:
      return <ShareRoomModal {...props} />;
    default:
      return null;
  }
};
