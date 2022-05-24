import "./ListItem.scss";

import {
  BsEye,
  BsEyeSlash,
  BsFiles,
  BsPencil,
  BsPersonDash,
  BsPersonPlus,
  BsThreeDots,
  BsX,
} from "react-icons/bs";

import React from "react";
import { useSelector } from "react-redux";
import DropdownMenu from "../DropdownMenu/DropdownMenu";

const ListItem = ({
  readOnly = false,
  item,
  onEdit,
  onClaim,
  onDelete,
  onDuplicate,
  onToggleEditorVisibility,
  className,
}) => {
  /*
    userName is used to determine if the claim option in the menu should be say 
    "Claim" or "Unclaim" based on whether or not userName matches item.claimedBy

    Note that this could be an issue if two users input the same userName
  */
  const userName = useSelector((state) => state.userName);

  const claimedByMe = item.claimedBy !== null && item.claimedBy === userName;

  return (
    <div className={`list-item ${className}`}>
      <div className="list-item-content-left">
        <span title={item.name} className="item-name">
          {item.name}
        </span>
        <span className="item-quantity">{item.quantity > 1 ? ` (${item.quantity})` : null}</span>
      </div>

      <div className="list-item-content-right">
        {item.claimedBy ? (
          <i title={"Claimed by " + item.claimedBy} className="item-claim">
            Claimed by {item.claimedBy}
          </i>
        ) : null}
        {readOnly ? null : (
          <>
            <DropdownMenu
              buttonIcon={<BsThreeDots />}
              placement="left-start"
              modifiers={[
                {
                  name: "flip",
                  enabled: true,
                },
              ]}
            >
              <DropdownMenu.Item
                onClick={onEdit}
                icon={<BsPencil style={{ transform: "scale(0.9) translate(-1px,0)" }} />}
                text="Edit"
              />
              <DropdownMenu.Item
                onClick={onDuplicate}
                icon={<BsFiles style={{ transform: "scale(0.9) translate(-3px,0)" }} />}
                text="Duplicate"
              />
              <DropdownMenu.Item
                onClick={onClaim}
                icon={claimedByMe ? <BsPersonDash /> : <BsPersonPlus />}
                text={claimedByMe ? "Unclaim" : "Claim"}
              />
              <DropdownMenu.Item
                onClick={onToggleEditorVisibility}
                icon={item.visibleInEditor ? <BsEyeSlash /> : <BsEye />}
                text={(item.visibleInEditor ? "Hide" : "Show") + " in Editor"}
              />
              <DropdownMenu.Item
                className="color-danger"
                onClick={onDelete}
                icon={<BsX />}
                text="Delete"
              />
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  );
};

export default ListItem;
