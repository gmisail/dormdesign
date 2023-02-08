import "./DropdownMenu.scss";

import React, { useRef, useState } from "react";

import Dropdown from "../Dropdown/Dropdown";
import IconButton from "../IconButton/IconButton";

const DropdownMenu = ({ buttonIcon, children, placement, modifiers }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuButtonRef = useRef();

  const onClickMenuItem = (callback) => {
    setShowMenu(false);
    if (callback) callback();
  };

  // Modify Item children with necessary props and remove non-Items
  const menuItemElements = React.Children.map(children, (child) => {
    return child.type?.name === Item.name
      ? React.cloneElement(child, {
          onClick: () => {
            // Wrap the item's onClick function in the onClickMenuItem so we can do additional stuff
            // when an item is clicked
            onClickMenuItem(child.props.onClick);
          },
        })
      : null;
  });

  return (
    <>
      <Dropdown
        show={showMenu}
        buttonRef={menuButtonRef}
        placement={placement}
        modifiers={modifiers}
        onClickOutside={() => {
          setShowMenu(false);
        }}
      >
        <ul className="dropdown-menu-list">{menuItemElements}</ul>
      </Dropdown>
      <IconButton
        title="Options"
        ref={menuButtonRef}
        className="dropdown-menu-button"
        onClick={() => setShowMenu(!showMenu)}
        circleSelectionEffect={true}
        toggled={showMenu}
      >
        {buttonIcon}
      </IconButton>
    </>
  );
};

const Item = ({ className, icon, text, onClick }) => {
  return (
    <li onClick={onClick} className={`dropdown-menu-list-item ${className ? className : ""}`}>
      {icon}
      {text}
    </li>
  );
};
DropdownMenu.Item = Item;

export default DropdownMenu;
