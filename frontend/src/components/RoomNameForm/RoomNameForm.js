import React from "react";
import RoomModel from "../../models/RoomModel";
import SingleInputForm from "../SingleInputForm/SingleInputForm";

function RoomNameForm({ roomName, onChangeRoomName }) {
  return (
    <SingleInputForm
      initialValue={roomName}
      submitButtonText="Save"
      submitButtonTextSuccessful="Saved!"
      onSubmit={onChangeRoomName}
      trim={true}
      allowEmptySubmit={false}
      maxLength={RoomModel.MAX_NAME_LENGTH}
    />
  );
}

export default RoomNameForm;
