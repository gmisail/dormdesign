import React, { useState } from "react";

export default function ConfirmationButton(props) {
  const [showConfirm, setShowConfirm] = useState(false);

  const { label, onConfirm } = props;

  return (
    <div className="d-flex flex-row flex-nowrap align-items-center">
      {showConfirm ? (
        <button className="custom-btn custom-btn-danger mr-2" onClick={onConfirm}>
          Confirm
        </button>
      ) : null}
      <button
        className={`custom-btn custom-btn-outline ${
          showConfirm ? "custom-btn-secondary" : "custom-btn-danger"
        }`}
        onClick={() => setShowConfirm(!showConfirm)}
      >
        {showConfirm ? "Cancel" : label}
      </button>
    </div>
  );
}
