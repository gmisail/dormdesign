import React, { useEffect, useState } from 'react'

import DataRequests from '../../controllers/DataRequests';

export default function RoomPreview({ id }) {
    const [url, setUrl] = useState("");

    useEffect(async () => {
        const data = await DataRequests.generatePreview(id);
        setUrl(data.url);
    }, [id]);

    return <img className="room-preview-image" src={url}></img>
}
