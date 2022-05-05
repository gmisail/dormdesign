import { BiLockAlt, BiLockOpenAlt } from "react-icons/bi";

import IconButton from "../../../components/IconButton/IconButton";
import React from "react";
import { RiClockwiseLine } from "react-icons/ri";

export default function ItemToolbar({ lockSelectedItem, rotateSelectedItem, hidden, locked }) {
  return (
    <>
      <IconButton
        className="room-editor-toolbar-btn"
        onClick={lockSelectedItem}
        title="Lock/Unlock item"
        data-hidden={hidden ? "true" : "false"}
      >
        {locked ? <BiLockAlt /> : <BiLockOpenAlt />}
      </IconButton>
      <IconButton
        className="room-editor-toolbar-btn"
        onClick={rotateSelectedItem}
        disabled={locked}
        title="Rotate item"
        data-hidden={hidden ? "true" : "false"}
      >
        <RiClockwiseLine />
      </IconButton>
    </>
  );
}
