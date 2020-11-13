import React, { useState, useEffect, useRef } from "react";
import {
  BsThreeDots,
  BsX,
  BsPencil,
  BsPerson,
  BsEye,
  BsEyeSlash,
} from "react-icons/bs";
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

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Called when a button in menu is clicked. Closes the menu and calls passed callback
  const menuOptionClicked = (callback) => {
    setShowMenu(false);
    callback();
  };

  useEffect(() => {
    // Clicked outside of menu
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
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
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <span>
            <strong>{item.name}</strong>
            {item.quantity > 1 ? ` (${item.quantity})` : null}
          </span>
        </div>

        <div className="d-flex align-items-center">
          {item.claimedBy ? (
            <i className="mr-3">Claimed by {item.claimedBy}</i>
          ) : null}

          <div className="item-dropdown-menu" ref={menuRef}>
            <IconButton onClick={() => setShowMenu(!showMenu)}>
              <BsThreeDots className="item-menu-button"></BsThreeDots>
            </IconButton>
            {showMenu ? (
              <div className="item-dropdown-content">
                <ul>
                  <li id="top" onClick={() => menuOptionClicked(onEdit)}>
                    <BsPencil />
                    Edit
                  </li>
                  <li onClick={() => menuOptionClicked(onClaim)}>
                    <BsPerson />
                    Claim
                  </li>
                  <li
                    onClick={() => menuOptionClicked(onToggleEditorVisibility)}
                  >
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
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListItem;
