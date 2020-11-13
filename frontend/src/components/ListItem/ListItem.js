import React, { useState, useEffect, useRef } from "react";
import {
  BsThreeDots,
  BsX,
  BsPencil,
  BsPerson,
  BsEye,
  BsEyeSlash,
} from "react-icons/bs";
import { ListGroupItem } from "react-bootstrap";
import IconButton from "../IconButton/IconButton";

import "./ListItem.css";

const ListItem = (props) => {
  const { item, onEdit, onClaim, onDelete, onToggleEditorVisibility } = props;

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
    <ListGroupItem>
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
                    <div className="item-dropdown-content-row">
                      <BsPencil></BsPencil>
                      <span>Edit</span>
                    </div>
                  </li>

                  <li onClick={() => menuOptionClicked(onClaim)}>
                    <div className="item-dropdown-content-row">
                      <BsPerson></BsPerson>
                      Claim
                    </div>
                  </li>

                  <li
                    onClick={() => menuOptionClicked(onToggleEditorVisibility)}
                  >
                    {item.visibleInEditor ? (
                      <span>
                        <BsEye />
                        Hide
                      </span>
                    ) : (
                      <span>
                        <BsEyeSlash />
                        Show
                      </span>
                    )}{" "}
                    in Editor
                  </li>

                  <li onClick={() => menuOptionClicked(onDelete)}>
                    <div className="color-danger item-dropdown-content-row">
                      <BsX></BsX>
                      Delete
                    </div>
                  </li>
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </ListGroupItem>
  );
};

export default ListItem;
