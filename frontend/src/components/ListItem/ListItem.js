import React, { Component } from "react";
import { ListGroupItem, Button } from "react-bootstrap";

const ListItem = props => {
    const { itemName, itemQty, claimedName } = props;
    
    return (
        <ListGroupItem>
            <div className="d-flex justify-content-between align-items-center">
                <span><strong>{itemName}</strong>{itemQty > 1 ? ` (${itemQty})` : null}</span>

                {claimedName == undefined ?
                    (
                        <Button variant="secondary" size="sm" onClick={() => { console.log(`Claim button clicked for ${itemName}`)}}>Claim</Button>
                    ) :
                    (
                        <i>Claimed by {claimedName}</i>
                    )
                }
            </div>
        </ListGroupItem>  
    )

}

export default ListItem;