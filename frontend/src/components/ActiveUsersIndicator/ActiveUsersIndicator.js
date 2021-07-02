import React from 'react'
import ActiveUser from './ActiveUser';

function ActiveUsersIndicator({ usernames, maxUsernames }) {
    const numberOfUsers = Object.keys(usernames).length;

    const showActiveUserBubble = (index, username) => {
        if(index == maxUsernames)
            return <ActiveUser username={"+ " + (numberOfUsers - maxUsernames)}/>
        else if(index < maxUsernames)
            return <ActiveUser username={username} />;
        else
            return <></>
    };

    return Object.keys(usernames).map((id, index) => showActiveUserBubble(index, usernames[id]));
}

export default ActiveUsersIndicator
