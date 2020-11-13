import React from "react";
import { ListGroup } from "react-bootstrap";
import ListItem from "../ListItem/ListItem";

const DormItemList = (props) => {
  const {
    items,
    selectedItemID,
    onEditItem,
    onClaimItem,
    onDeleteItem,
    onToggleEditorVisibility,
  } = props;

  return (
    <ListGroup>
      {!items || !items.length ? (
        <h6>No items have been added yet</h6>
      ) : (
        items.map((item) => {
          return (
            <ListItem
              className={selectedItemID === item.id ? "item-selected" : ""}
              key={item.id}
              item={item}
              onEdit={() => onEditItem(item)}
              onClaim={() => onClaimItem(item)}
              onDelete={() => onDeleteItem(item)}
              onToggleEditorVisibility={() => onToggleEditorVisibility(item)}
            />
          );
        })
      )}
    </ListGroup>
  );
};

export default DormItemList;
