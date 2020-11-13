import React from "react";
import "./IconButton.css";

const IconButton = (props) => {
  const { onClick, children, className, disabled, style } = props;
  return (
    <button
      className={"icon-button " + className}
      disabled={disabled}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );
};

export default IconButton;
