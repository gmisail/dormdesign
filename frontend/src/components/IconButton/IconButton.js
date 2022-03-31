import React, { forwardRef } from "react";
import "./IconButton.scss";

const IconButton = forwardRef((props, ref) => {
  const { children, className, circleSelectionEffect, toggled, ...otherProps } = props;

  return (
    <button
      {...otherProps}
      ref={ref}
      className={
        "icon-button" +
        (circleSelectionEffect ? " circle-selection-effect" : "") +
        (toggled ? " toggled" : "") +
        (className ? " " + className : "")
      }
    >
      {children}
    </button>
  );
});

export default IconButton;
