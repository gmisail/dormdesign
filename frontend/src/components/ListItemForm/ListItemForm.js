import React, { Component } from "react";
import { Button, Col } from "react-bootstrap";
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

    let width = "",
      length = "";
    if (item.dimensions) {
      width = item.dimensions.width ?? "";
      length = item.dimensions.length ?? "";
    }

    this.state = {
      item: item,
      nameInputValue: name,
      qtyInputValue: item.quantity,
      claimedByInputValue: item.claimedBy ?? "",
      widthInputValue: width,
      lengthInputValue: length,
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

    this.setState({
      [name]: value,
    });
  };

  /*
  Called when form is submitted. If form fields are valid, returns item ID and an object containing the DormItem
  fields that were modified and their new values. Currently property values are in a form that is ready
  to be sent and interpreted by the Golang backend, meaning undefined values are instead set to Golang
  zero values (e.g. "" for strings)
  */
  onFormSubmit = (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    this.setState({ validated: true });
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
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

      // If NaN set to 0 (which is treated like undefined)
      if (isNaN(widthInputValue)) {
        widthInputValue = 0;
      } else {
        widthInputValue = parseFloat(widthInputValue);
      }
      if (isNaN(lengthInputValue)) {
        lengthInputValue = 0;
      } else {
        lengthInputValue = parseFloat(lengthInputValue);
      }

      // If dimension values aren't zero, compare them with old item dimensions. Otherwise, check if item values are undefined
      const widthEqual =
        widthInputValue !== 0
          ? Math.abs(widthInputValue - item.dimensions.width) < 0.0001
          : item.dimensions.width === undefined;
      const lengthEqual =
        lengthInputValue !== 0
          ? Math.abs(lengthInputValue - item.dimensions.length) < 0.0001
          : item.dimensions.length === undefined;
      if (!widthEqual || !lengthEqual) {
        modifiedProperties.dimensions = {
          width: widthInputValue,
          length: lengthInputValue,
          height: 0, // TODO: replace when form has a height field
        };
      }

      // claimbedBy == "" and a previous value of undefined means no change.
      if (
        (claimedByInputValue.length === 0 && item.claimedBy !== undefined) ||
        (claimedByInputValue.length !== 0 &&
          claimedByInputValue !== item.claimedBy)
      ) {
        modifiedProperties.claimbedBy = claimedByInputValue;
      }
      if (visibleInEditorValue !== item.visibleInEditor) {
        modifiedProperties.visibleInEditor = visibleInEditorValue;
      }

      this.props.onSubmit(item.id, modifiedProperties);
    }
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
          <Button variant="primary" type="submit">
            Save
          </Button>
        </div>
      </Form>
    );
  }
}

export default ListItemForm;
