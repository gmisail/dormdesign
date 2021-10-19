import { BiLockAlt, BiLockOpenAlt } from "react-icons/bi";

import IconButton from "../IconButton/IconButton";
import React from "react";
import { RiClockwiseLine } from "react-icons/ri";

export default function ItemToolbar({
  lockSelectedItem,
  rotateSelectedItem,
  selectedItemID,
  locked,
}) {
  return (
    <>
      <IconButton
        className="room-editor-toolbar-btn"
        onClick={lockSelectedItem}
        data-hidden={selectedItemID === null ? "true" : "false"}
      >
        {locked ? <BiLockAlt /> : <BiLockOpenAlt />}
      </IconButton>
      <IconButton
        className="room-editor-toolbar-btn"
        onClick={rotateSelectedItem}
        disabled={locked}
        data-hidden={selectedItemID === null ? "true" : "false"}
      >
        <RiClockwiseLine />
      </IconButton>
    </>
  );
}
