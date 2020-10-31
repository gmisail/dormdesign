import React from "react";
import { ListGroup } from "react-bootstrap";

import ListItem from "../ListItem/ListItem";

const DormItemList = (props) => {
  const { items, onEditItem, onClaimItem } = props;

  return (
    <ListGroup>
      {!items || !items.length ? (
        <h6>No items have been added yet</h6>
      ) : (
        items.map((item) => {
          return (
            <ListItem
              key={item.id}
              item={item}
              onEdit={() => onEditItem(item)}
              onClaim={() => onClaimItem(item)}
            />
          );
        })
      )}
    </ListGroup>
  );
};

export default DormItemList;
