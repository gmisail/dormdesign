import React, { useState, useEffect, useRef, useContext } from "react";
import {
  BsThreeDots,
  BsX,
  BsPencil,
  BsPersonPlus,
  BsPersonDash,
  BsEye,
  BsEyeSlash,
  BsFiles,
} from "react-icons/bs";
import { usePopper } from "react-popper";
import { RoomContext } from "../../context/RoomContext";
import IconButton from "../IconButton/IconButton";
import { modalTypes, Modal } from "../../components/modals/Modal";
import useModal from "../../hooks/useModal";

import "./ListItem.scss";

const ListItem = (props) => {
  const {
    item,
    onEdit,
    onClaim,
    onDelete,
    onDuplicate,
    onToggleEditorVisibility,
    className,
  } = props;

  /*
    userName is used to determine if the claim option in the menu should be say 
    "Claim" or "Unclaim" based on whether or not userName matches item.claimedBy

    Note that this could be an issue if two users input the same userName
  */
  const { userName, setUserName } = useContext(RoomContext);
  const [modalProps, toggleModal] = useModal();
  const [showMenu, setShowMenu] = useState(false);
  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);
  const { styles, attributes } = usePopper(
    menuButtonRef.current,
    menuRef.current,
    {
      placement: "left-start",
      modifiers: [
        {
          name: "flip",
          enabled: true,
        },
      ],
    }
  );

  // Called when a button in menu is clicked. Closes the menu and calls passed callback
  const menuOptionClicked = (callback) => {
    if (callback === onClaim && userName === null) {
      toggleModal(modalTypes.chooseName, {
        onSubmit: (newName) => {
          setUserName(newName);
          toggleModal();
        },
      });

      return;
    }

    setShowMenu(false);
    callback();
  };

  useEffect(() => {
    // Clicked outside of menu (and also button)
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className={`list-item ${className}`}>
      <div className="list-item-content">
        <span>
          <span className="item-name">{item.name}</span>
          <span className="item-quantity">
            {item.quantity > 1 ? ` (${item.quantity})` : null}
          </span>
        </span>
      </div>

      <div className="list-item-content">
        {item.claimedBy ? (
          <i className="mr-3">Claimed by {item.claimedBy}</i>
        ) : null}
        <IconButton
          ref={menuButtonRef}
          className="item-menu-button"
          onClick={() => setShowMenu(!showMenu)}
        >
          <BsThreeDots></BsThreeDots>
        </IconButton>
        <div
          ref={menuRef}
          className={`item-dropdown-menu ${showMenu ? "" : "hidden"}`}
          style={styles.popper}
          {...attributes.popper}
        >
          <ul>
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

            <li
              className="color-danger"
              onClick={() => menuOptionClicked(onDelete)}
            >
              <BsX />
              Delete
            </li>
          </ul>
        </div>
      </div>
      <Modal {...modalProps}></Modal>
    </div>
  );
};

export default ListItem;
