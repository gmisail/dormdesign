import React from "react";

import AddModal from "./AddModal";
import EditModal from "./EditModal";
import NameModal from "./NameModal";
import SettingsModal from "./SettingsModal";
import ShareRoomModal from "./ShareRoomModal";
import ErrorModal from "./ErrorModal";
import RoomNameModal from "./RoomNameModal";
import ShareTemplateModal from "./ShareTemplateModal";
import CloneTemplateModal from "./CloneTemplateModal/CloneTemplateModal";

export const modalTypes = {
  add: "ADD",
  edit: "EDIT",
  chooseName: "CHOOSE_NAME",
  updateRoomName: "UPDATE_ROOM_NAME",
  error: "ERROR",
  settings: "SETTINGS",
  shareRoom: "SHARE_ROOM",
  shareTemplate: "SHARE_TEMPLATE",
  cloneTemplate: "CLONE_TEMPLATE",
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
    case modalTypes.shareRoom:
      return <ShareRoomModal {...props} />;
    case modalTypes.shareTemplate:
      return <ShareTemplateModal {...props} />;
    case modalTypes.cloneTemplate:
      return <CloneTemplateModal {...props} />;
    default:
      return null;
  }
};
