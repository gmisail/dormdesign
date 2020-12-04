import React, { forwardRef } from "react";
import "./IconButton.scss";

const IconButton = forwardRef((props, ref) => {
  const { onClick, children, className, disabled, style } = props;
  return (
    <button
      ref={ref}
      className={"icon-button" + (className ? " " + className : "")}
      disabled={disabled}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );
});

export default IconButton;
