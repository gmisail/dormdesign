import React, { useState, useEffect, useRef } from "react";
import { BsThreeDots } from "react-icons/bs";
import { ListGroupItem } from "react-bootstrap";
import IconButton from "../IconButton/IconButton";
import "./ListItem.css";

const ListItem = (props) => {
  const { item, onEdit, onClaim, onDelete } = props;

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

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
          {item.claimedBy === undefined ||
          item.claimedBy.length === 0 ? null : (
            <i className="mr-3">Claimed by {item.claimedBy}</i>
          )}

          <div className="item-dropdown-menu" ref={menuRef}>
            <IconButton onClick={() => setShowMenu(!showMenu)}>
              <BsThreeDots className="item-menu-button"></BsThreeDots>
            </IconButton>
            {showMenu ? (
              <div className="item-dropdown-content">
                <ul>
                  <li onClick={onEdit}>Edit</li>
                  <li onClick={onClaim}>Claim</li>
                  <li id="danger" onClick={onDelete}>
                    Delete
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
