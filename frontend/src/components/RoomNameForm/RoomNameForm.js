import React from "react";
import Room from "../../models/Room";
import SingleInputForm from "../SingleInputForm/SingleInputForm";

function RoomNameForm({ roomName, onChangeRoomName }) {
  return (
    <SingleInputForm
      initialValue={roomName}
      onSubmit={onChangeRoomName}
      trim={true}
      allowEmptySubmit={false}
      maxLength={Room.MAX_NAME_LENGTH}
    />
  );
}

export default RoomNameForm;
