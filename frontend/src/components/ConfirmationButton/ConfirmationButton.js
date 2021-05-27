import React, { useState } from 'react'

export default function ConfirmationButton(props) {
    const [ confirmed, setConfirmed ] = useState(false);

    const onConfirm = () => {
        if(confirmed)
            props.onConfirm();
        else 
            setConfirmed(true);
    }

    return (
        <button 
            className="custom-btn custom-btn-warning w-100"
          onClick={ onConfirm }
        >
          {props.name} { confirmed ? <>(Are You Sure?)</> : <></> }
        </button>
    )
}
