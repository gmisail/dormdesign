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

import { Modal, modalTypes } from "../../components/modals/Modal";
import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Dropdown from "../Dropdown/Dropdown";
import IconButton from "../IconButton/IconButton";
import { setUserName } from "../../context/RoomStore";
import useModal from "../../hooks/useModal";

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

  const dispatch = useDispatch();

  const [modalProps, toggleModal] = useModal();
  const [showMenu, setShowMenu] = useState(false);
  const menuButtonRef = useRef(null);

  // Called when a button in menu is clicked. Closes the menu and calls passed callback
  const menuOptionClicked = (callback) => {
    if (callback === onClaim && userName === null) {
      toggleModal(modalTypes.chooseName, {
        onSubmit: (newName) => {
          dispatch(setUserName(newName));
          toggleModal();
        },
      });

      return;
    }

    setShowMenu(false);
    callback();
  };

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
            <IconButton
              title="Options"
              ref={menuButtonRef}
              className="item-menu-button"
              onClick={() => setShowMenu(!showMenu)}
              circleSelectionEffect={true}
              toggled={showMenu}
            >
              <BsThreeDots></BsThreeDots>
            </IconButton>
            <Dropdown
              show={showMenu}
              buttonRef={menuButtonRef}
              onClickOutside={() => setShowMenu(false)}
              placement="left-start"
              modifiers={[
                {
                  name: "flip",
                  enabled: true,
                },
              ]}
            >
              <ul className="item-menu-list">
                <li onClick={() => menuOptionClicked(onEdit)}>
                  <BsPencil />
                  Edit
                </li>
                <li onClick={() => menuOptionClicked(onDuplicate)}>
                  <BsFiles />
                  Duplicate
                </li>
                <li onClick={() => menuOptionClicked(onClaim)}>
                  {item.claimedBy !== null && item.claimedBy === userName ? (
                    <>
                      <BsPersonDash />
                      Unclaim
                    </>
                  ) : (
                    <>
                      <BsPersonPlus />
                      Claim
                    </>
                  )}
                </li>
                <li onClick={() => menuOptionClicked(onToggleEditorVisibility)}>
                  {item.visibleInEditor ? (
                    <>
                      <BsEyeSlash />
                      Hide
                    </>
                  ) : (
                    <>
                      <BsEye />
                      Show
                    </>
                  )}{" "}
                  in Editor
                </li>

                <li className="color-danger" onClick={() => menuOptionClicked(onDelete)}>
                  <BsX />
                  Delete
                </li>
              </ul>
            </Dropdown>
          </>
        )}
      </div>
      <Modal {...modalProps}></Modal>
    </div>
  );
};

export default ListItem;
