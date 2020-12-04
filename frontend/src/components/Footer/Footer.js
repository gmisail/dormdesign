import React from "react";
import IconButton from "../IconButton/IconButton";
import { GoMarkGithub } from "react-icons/go";
import "./Footer.scss";

const Footer = () => {
  return (
    <div className="footer">
      <a
        href="https://github.com/gmisail/dormdesign"
        className="github-repo-link"
      >
        <IconButton>
          <GoMarkGithub />
        </IconButton>
      </a>
      <span>
        An <a href="https://rcos.io/">RCOS</a> Project
      </span>
    </div>
  );
};

export default Footer;
