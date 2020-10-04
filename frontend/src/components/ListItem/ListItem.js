import React from "react";
import { BsPencilSquare } from "react-icons/bs";
import { ListGroupItem, Button } from "react-bootstrap";

const ListItem = (props) => {
  const { itemName, itemQty, claimedName } = props;

  return (
    <ListGroupItem>
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <span>
            <strong>{itemName}</strong>
            {itemQty > 1 ? ` (${itemQty})` : null}
          </span>
        </div>
        <div>
          {claimedName === undefined ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                console.log(`Claim button clicked for ${itemName}`);
              }}
            >
              Claim
            </Button>
          ) : (
            <i>Claimed by {claimedName}</i>
          )}
          <Button
            className="ml-2"
            size="sm"
            variant="secondary"
            onClick={() => {
              console.log(`Edit button clicked for ${itemName}`);
            }}
          >
            <BsPencilSquare />
          </Button>
        </div>
      </div>
    </ListGroupItem>
  );
};

export default ListItem;
