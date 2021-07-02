import React from 'react'
import "./ActiveUser.scss";

function ActiveUser({ username }) {
    return (
        <span className="active-user-bubble">
            { username }
        </span>
    )
}

export default ActiveUser
