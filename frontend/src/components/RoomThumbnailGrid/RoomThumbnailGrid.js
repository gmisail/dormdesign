import "./RoomThumbnailGrid.scss";
import { Spinner } from "react-bootstrap";

const RoomThumbnailGrid = ({ header, emptyMessage, loadingSpinner, children }) => {
  return (
    <div className="room-thumbnail-grid-container">
      <div className="room-thumbnail-grid">
        <div className="room-thumbnail-grid-header">{header}</div>
        {children === null && loadingSpinner ? (
          <Spinner className="room-thumbnail-grid-spinner" animation="border" variant="secondary" />
        ) : children.length === 0 && emptyMessage ? (
          <p className="room-thumbnail-grid-empty-message">{emptyMessage}</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default RoomThumbnailGrid;
