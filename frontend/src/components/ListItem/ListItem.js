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
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import IconButton from "../IconButton/IconButton";
import { setUserName } from "../../context/RoomStore";
import useModal from "../../hooks/useModal";
import { usePopper } from "react-popper";

const ListItem = ({
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
  const menuRef = useRef(null);
  const { styles, attributes } = usePopper(menuButtonRef.current, menuRef.current, {
    placement: "left-start",
    modifiers: [
      {
        name: "flip",
        enabled: true,
      },
    ],
  });

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
          <span className="item-quantity">{item.quantity > 1 ? ` (${item.quantity})` : null}</span>
        </span>
      </div>

      <div className="list-item-content">
        {item.claimedBy ? <i className="mr-3">Claimed by {item.claimedBy}</i> : null}
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

            <li className="color-danger" onClick={() => menuOptionClicked(onDelete)}>
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
