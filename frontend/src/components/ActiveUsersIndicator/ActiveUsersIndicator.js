import React, { useState, useRef } from "react";
import "./ActiveUsersIndicator.scss";
import { useSelector } from "react-redux";
import Dropdown from "../Dropdown/Dropdown";
import { BsPerson, BsPersonFill } from "react-icons/bs";
import IconButton from "../IconButton/IconButton";

/**
 * Displays a list of bubbles with usernames (if more than 1 usernames exist)
 */
function ActiveUsersIndicator() {
  const usernames = useSelector((state) => state.userNames);
  const [showDropdown, setShowDropdown] = useState(false);
  const buttonRef = useRef(null);

  return (
    <>
      <IconButton
        title={
          usernames.length + " currently active " + (usernames.length === 1 ? "user" : "users")
        }
        ref={buttonRef}
        className="active-users-btn"
        circleSelectionEffect={true}
        toggled={showDropdown}
        onClick={() => {
          setShowDropdown(!showDropdown);
        }}
      >
        <BsPerson className="active-users-icon" />
        <span>{usernames.length}</span>
      </IconButton>
      <Dropdown
        className="active-users-dropdown"
        show={showDropdown}
        onClickOutside={() => {
          setShowDropdown(false);
        }}
        placement="bottom-end"
        buttonRef={buttonRef}
      >
        <strong>Active Users ({usernames.length})</strong>
        <hr />
        <div className="active-users-list">
          {usernames.map((name, index) => {
            return (
              <div className="active-users-item" title={name} key={index}>
                <BsPersonFill />
                <span>{name}</span>
              </div>
            );
          })}
        </div>
      </Dropdown>
    </>
  );
}

export default ActiveUsersIndicator;
