import "./DormItemList.scss";

import ListItem from "./ListItem";
import React from "react";
import { useSelector } from "react-redux";

const DormItemList = (props) => {
  const {
    readOnly = false,
    onEditItem,
    onDuplicateItem,
    onClaimItem,
    onDeleteItem,
    onToggleEditorVisibility,
  } = props;

  const selectedItemID = useSelector((state) => state.selectedItemID);
  const items = useSelector((state) => state.items);

  return (
    <>
      {!items || !items.length ? (
        <p className="text-center font-weight-bold mt-3">No items have been added yet</p>
      ) : (
        <div className="list-item-group custom-card">
          {items.map((item) => {
            return (
              <ListItem
                readOnly={readOnly}
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
