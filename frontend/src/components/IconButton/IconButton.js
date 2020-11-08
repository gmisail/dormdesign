import React from "react";
import "./IconButton.css";

const IconButton = (props) => {
  const { onClick, children, className, disabled } = props;
  return (
    <button
      className={"icon-button " + className}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default IconButton;
