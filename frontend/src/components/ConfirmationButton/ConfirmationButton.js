import React, { useState } from "react";

export default function ConfirmationButton(props) {
  const [confirmed, setConfirmed] = useState(false);

  const onConfirm = () => {
    if (confirmed) props.onConfirm();
    else setConfirmed(true);
  };

  return (
    <button
      className={`${props.className} custom-btn custom-btn-outline custom-btn-danger w-100`}
      onClick={onConfirm}
    >
      {props.children}
    </button>
  );
}
