import "./ClipboardLink.scss";

import { MdOutlineFileCopy } from "react-icons/md";

import IconButton from "../IconButton/IconButton";

const ClipboardLink = ({ url }) => {
  return (
    <div className="clipboard-link">
      <div className="clipboard-link-text">{url}</div>
      <IconButton
        title="Copy to Clipboard"
        circleSelectionEffect={true}
        className="clipboard-link-btn"
        onClick={() => {
          if (url) navigator.clipboard.writeText(url);
        }}
      >
        <MdOutlineFileCopy />
      </IconButton>
    </div>
  );
};

export default ClipboardLink;
