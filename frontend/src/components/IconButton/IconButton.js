import React, { forwardRef } from "react";
import "./IconButton.scss";

const IconButton = forwardRef((props, ref) => {
  const { children, className } = props;
  return (
    <button
      {...props}
      ref={ref}
      className={"icon-button" + (className ? " " + className : "")}
    >
      {children}
    </button>
  );
});

export default IconButton;
