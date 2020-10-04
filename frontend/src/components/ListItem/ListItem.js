import React from "react";
import { BsPencilSquare } from "react-icons/bs";
import { ListGroupItem, Button } from "react-bootstrap";

const ListItem = (props) => {
  const { item, onEdit } = props;

  return (
    <ListGroupItem>
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <span>
            <strong>{item.name}</strong>
            {item.quantity > 1 ? ` (${item.quantity})` : null}
          </span>
        </div>

        <div>
          {item.claimedBy === undefined ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                console.log(`Claim button clicked for ${item.name}`);
              }}
            >
              Claim
            </Button>
          ) : (
            <i className="align-middle mr-1">Claimed by {item.claimedBy}</i>
          )}
          <Button
            className="ml-2"
            size="sm"
            variant="secondary"
            onClick={() => {
              onEdit(item);
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
