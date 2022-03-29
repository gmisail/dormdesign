import "./Dropdown.scss";
import React, { useState, useRef, useEffect } from "react";
import { usePopper } from "react-popper";

/**
 * Dropdown menu toggled by a button
 */
const Dropdown = ({
  show,
  onClickOutside,
  placement,
  modifiers,
  buttonRef,
  children,
  className,
}) => {
  const dropdownRef = useRef(null);
  const { styles, attributes } = usePopper(buttonRef.current, dropdownRef.current, {
    placement: placement,
    modifiers: modifiers,
  });

  useEffect(() => {
    // Clicked outside of menu (and also button)
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        onClickOutside();
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div
      ref={dropdownRef}
      className={"dropdown" + (show ? "" : " hidden") + (className ? " " + className : "")}
      style={styles.popper}
      {...attributes.popper}
    >
      {children}
    </div>
  );
};

export default Dropdown;
