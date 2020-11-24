import React, { useState, useEffect, useRef, useContext } from "react";
import {
  BsThreeDots,
  BsX,
  BsPencil,
  BsPersonPlus,
  BsPersonDash,
  BsEye,
  BsEyeSlash,
} from "react-icons/bs";
import { usePopper } from "react-popper";
import { RoomContext } from "../../routes/RoomRoute/RoomContext";
import IconButton from "../IconButton/IconButton";

import "./ListItem.scss";

const ListItem = (props) => {
  const {
    item,
    onEdit,
    onClaim,
    onDelete,
    onToggleEditorVisibility,
    className,
  } = props;

  const { name } = useContext(RoomContext);

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
            <li id="top" onClick={() => menuOptionClicked(onEdit)}>
              <BsPencil />
              Edit
            </li>
            <li onClick={() => menuOptionClicked(onClaim)}>
              {item.claimedBy === name ? (
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
    </div>
  );
};

export default ListItem;
