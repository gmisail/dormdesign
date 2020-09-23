import React, { Component } from "react";
import RoomCanvas from "../components/RoomCanvas/RoomCanvas"

class EditorRoute extends Component {

    render() {
        return <>
            <h2>My Room</h2>
            <RoomCanvas />
        </>
    }

}

export default EditorRoute;