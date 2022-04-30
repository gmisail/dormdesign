import "./RoomThumbnail.scss";
import { Link } from "react-router-dom";
import RoomPreview from "../RoomPreview/RoomPreview";

const RoomThumbnail = ({ dropdownMenu, name, id, isTemplate = false }) => {
  const url = `/${isTemplate ? "template" : "room"}/${id}`;
  return (
    <div className={`room-thumbnail ${dropdownMenu ? "room-thumbnail-with-dropdown" : ""}`}>
      {dropdownMenu ?? null}
      <Link to={url} className="room-thumbnail-link" title={name}>
        <p className="room-thumbnail-name">{name}</p>
        <RoomPreview id={id} isTemplate={isTemplate} />
      </Link>
    </div>
  );
};

export default RoomThumbnail;
