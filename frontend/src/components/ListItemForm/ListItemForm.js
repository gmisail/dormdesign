import React, { Component } from "react";
import { Col } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import DormItem from "../../models/DormItem";

class ListItemForm extends Component {
  constructor(props) {
    super(props);
    let item = props.item;

    // Name for new items should be blank
    const name = item ? item.name : "";
    if (!item) {
      item = new DormItem();
    }

    this.state = {
      item: item,
      nameInputValue: name,
      qtyInputValue: item.quantity,
      claimedByInputValue: item.claimedBy ?? "",
      widthInputValue: item.dimensions?.width ?? "",
      lengthInputValue: item.dimensions?.length ?? "",
      visibleInEditorValue: item.visibleInEditor,
      validated: false,
    };
  }

  handleInputChange = (event) => {
    const target = event.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    // Limit values for inputs
    if (name === "qtyInputValue") {
      if (value.length !== 0) {
        value = Math.min(100, Math.max(1, value));
      }
    } else if (name === "nameInputValue") {
      value = value.substring(0, 30);
    } else if (name === "claimedByInputValue") {
      value = value.substring(0, 30);
    }

    if (name === "widthInputValue" || name === "lengthInputValue") {
      value = Math.max(0, value);
    }

    this.setState({
      [name]: value,
    });
  };

  /*
    Called when form is submitted. If form fields are valid, returns item ID and an object containing the 
    DormItem fields that were modified and their new values.
  */
  onFormSubmit = (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    this.setState({ validated: true });

    // Don't continue if form isn't valid
    if (form.checkValidity() === false) {
      event.stopPropagation();
      return;
    }

    let {
      nameInputValue,
      qtyInputValue,
      widthInputValue,
      lengthInputValue,
      visibleInEditorValue,
      claimedByInputValue,
    } = this.state;

    let item = this.state.item;
    let modifiedProperties = {};

    if (nameInputValue !== item.name) {
      modifiedProperties.name = nameInputValue;
    }
    if (qtyInputValue !== item.quantity) {
      modifiedProperties.quantity = parseInt(qtyInputValue);
    }

    widthInputValue = parseFloat(widthInputValue) ?? null;
    lengthInputValue = parseFloat(lengthInputValue) ?? null;

    const widthEqual = widthInputValue
      ? Math.abs(widthInputValue - item.dimensions.width) < 0.0001
      : item.dimensions.width === null;
    const lengthEqual = lengthInputValue
      ? Math.abs(lengthInputValue - item.dimensions.length) < 0.0001
      : item.dimensions.length === null;
    if (!widthEqual || !lengthEqual) {
      modifiedProperties.dimensions = {
        width: widthInputValue,
        length: lengthInputValue,
        height: null, // TODO: replace when form has a height field
      };
    }

    if (
      (!claimedByInputValue && item.claimedBy) ||
      (claimedByInputValue && claimedByInputValue !== item.claimedBy)
    ) {
      modifiedProperties.claimedBy = claimedByInputValue
        ? claimedByInputValue
        : null;
    }
    if (visibleInEditorValue !== item.visibleInEditor) {
      modifiedProperties.visibleInEditor = visibleInEditorValue;
    }

    this.props.onSubmit(item.id, modifiedProperties);
  };

  render() {
    return (
      <Form
        noValidate
        validated={this.state.validated}
        onSubmit={this.onFormSubmit}
      >
        <Form.Group controlId="formItemName">
          <Form.Label>Name*</Form.Label>
          <Form.Control
            name="nameInputValue"
            value={this.state.nameInputValue}
            placeholder="Enter Item Name"
            onChange={this.handleInputChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Please choose an item name.
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="formItemQuantity">
          <Form.Label>Quantity*</Form.Label>
          <Form.Control
            name="qtyInputValue"
            type="number"
            value={this.state.qtyInputValue}
            placeholder="How many of this item"
            onChange={this.handleInputChange}
            onKeyDown={(evt) =>
              (evt.key === "e" || evt.key === "." || evt.key === "-") &&
              evt.preventDefault()
            }
            required
          />
          <Form.Control.Feedback type="invalid">
            Please specificy item quantity.
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="formItemOwner">
          <Form.Label>Name of Owner</Form.Label>
          <Form.Control
            name="claimedByInputValue"
            value={this.state.claimedByInputValue}
            placeholder="Name of the person that this belongs too"
            onChange={this.handleInputChange}
          />
        </Form.Group>
        <Form.Group controlId="formItemDimensions">
          <Form.Label>Dimensions</Form.Label>
          <Form.Row>
            <Col>
              <Form.Control
                name="widthInputValue"
                type="number"
                value={this.state.widthInputValue}
                placeholder="Width"
                onChange={this.handleInputChange}
                onKeyDown={(evt) =>
                  (evt.key === "e" || evt.key === "-") && evt.preventDefault()
                }
              />
            </Col>
            <Col>
              <Form.Control
                name="lengthInputValue"
                type="number"
                value={this.state.lengthInputValue}
                placeholder="Length"
                onChange={this.handleInputChange}
                onKeyDown={(evt) =>
                  (evt.key === "e" || evt.key === "-") && evt.preventDefault()
                }
              />
            </Col>
          </Form.Row>
        </Form.Group>
        <Form.Group>
          <Form.Check
            label="Show in Room Editor"
            name="visibleInEditorValue"
            checked={this.state.visibleInEditorValue}
            onChange={this.handleInputChange}
          />
        </Form.Group>
        <div className="text-right">
          <button className="custom-btn" type="submit">
            Save
          </button>
        </div>
      </Form>
    );
  }
}

export default ListItemForm;
