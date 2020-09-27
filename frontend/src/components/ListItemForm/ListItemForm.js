import React, { Component } from "react";
import { Button, Col } from "react-bootstrap";
import Form from "react-bootstrap/Form";

class ListItemForm extends Component {
  constructor(props) {
    super(props);
    let item = props.item;
    if (!item) {
      item = {
        id: undefined,
        name: "",
        quantity: 1,
        claimedBy: undefined,
        dimensions: {
          w: undefined,
          l: undefined,
          h: undefined,
        },
      };
    }
    this.state = {
      item: item,
      nameInputValue: item.name,
      qtyInputValue: item.quantity,
      ownerInputValue: item.claimedBy ?? "",
      widthInputValue: item.dimensions.w ?? "",
      lengthInputValue: item.dimensions.l ?? "",
      validated: false,
    };
  }

  handleInputChange = (event) => {
    const target = event.target;
    let value = target.value;
    const name = target.name;

    // Limit values for inputs
    if (name === "qtyInputValue") {
      if (value.length !== 0) {
        value = Math.min(100, Math.max(1, value));
      }
    } else if (name === "nameInputValue") {
      value = value.substring(0, 30);
    } else if (name === "ownerInputValue") {
      value = value.substring(0, 30);
    }

    this.setState({
      [name]: value,
    });
  };

  onFormSubmit = (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    this.setState({ validated: true });
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      let item = this.state.item;
      item.name = this.state.nameInputValue;
      item.quantity = parseInt(this.state.qtyInputValue);
      item.claimedBy = this.state.ownerInputValue;
      const width = parseFloat(this.state.widthInputValue);
      const length = parseFloat(this.state.lengthInputValue);
      item.dimensions.w = isNaN(width) ? undefined : width;
      item.dimensions.l = isNaN(length) ? undefined : length;
      this.props.onSubmit(item);
    }
  };

  render() {
    return (
      <Form
        noValidate
        validated={this.state.validated}
        onSubmit={this.onFormSubmit}
      >
        <Form.Group controlId="formItemName" controlId="validationCustomName">
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
        <Form.Group
          controlId="formItemQuantity"
          controlId="validationCustomQty"
        >
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
        <Form.Group controlId="formItemOwner" controlId="validationCustomOwner">
          <Form.Label>Name of Owner</Form.Label>
          <Form.Control
            name="ownerInputValue"
            value={this.state.ownerInputValue}
            placeholder="Name of the person that this belongs too"
            onChange={this.handleInputChange}
          />
        </Form.Group>
        <Form.Group
          controlId="formItemQuantity"
          controlId="validationCustomQty"
        >
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
