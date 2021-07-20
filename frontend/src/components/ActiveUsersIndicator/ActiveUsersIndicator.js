import ActiveUser from "./ActiveUser";
import React from "react";
import { useSelector } from "react-redux";

/**
 * Displays a list of bubbles with usernames (if more than 1 usernames exist)
 */
function ActiveUsersIndicator({ maxUsernames }) {
  const usernames = useSelector((state) => state.userNames);
  const numberOfUsers = Object.keys(usernames).length;

  const showActiveUserBubble = (index, username) => {
    if (index == maxUsernames)
      return <ActiveUser key={index} username={"+ " + (numberOfUsers - maxUsernames)} />;
    else if (index < maxUsernames) return <ActiveUser key={index} username={username} />;
    else return <></>;
  };

  return numberOfUsers <= 1 ? (
    <></>
  ) : (
    Object.keys(usernames).map((id, index) => showActiveUserBubble(index, usernames[id]))
  );
}

export default ActiveUsersIndicator;
