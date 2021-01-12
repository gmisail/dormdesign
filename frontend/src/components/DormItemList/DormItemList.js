import React from "react";
import ListItem from "../ListItem/ListItem";
import "./DormItemList.scss";

const DormItemList = (props) => {
  const {
    items,
    selectedItemID,
    onEditItem,
    onDuplicateItem,
    onClaimItem,
    onDeleteItem,
    onToggleEditorVisibility,
  } = props;

  return (
    <>
      {!items || !items.length ? (
        <h6 className="text-center mt-3">No items have been added yet.</h6>
      ) : (
        <div className="list-item-group custom-card">
          {items.map((item) => {
            return (
              <ListItem
                className={selectedItemID === item.id ? "item-selected" : ""}
                key={item.id}
                item={item}
                onEdit={() => onEditItem(item)}
                onClaim={() => onClaimItem(item)}
                onDelete={() => onDeleteItem(item)}
                onDuplicate={() => onDuplicateItem(item)}
                onToggleEditorVisibility={() => onToggleEditorVisibility(item)}
              />
            );
          })}
        </div>
      )}
    </>
  );
};

export default DormItemList;
