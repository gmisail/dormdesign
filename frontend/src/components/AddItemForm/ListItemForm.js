import React, { Component } from "react";
import { Button } from "react-bootstrap";
import Form from 'react-bootstrap/Form';

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
      }
    }
    this.state = {
      item: item,
      nameInputValue: item.name,
    }
  }
  

  handleInputChange = event => {
    const target = event.target;
    const value = target.value;
    const name = target.name;
        
    this.setState({
        [name]: value
    });
  }
  
  onFormSubmit = (event) => {
    event.preventDefault();
    let item = this.state.item;
    item.name = this.state.nameInputValue;
    this.props.onSave(item);
  }

  render() {
    return (
      <Form onSubmit={this.onFormSubmit}>
          <Form.Group controlId="formItemName">
              <Form.Label>Item Name</Form.Label>
              <Form.Control name="nameInputValue" value={this.state.nameInputValue} placeholder="Enter Item Name" onChange={this.handleInputChange} />
          </Form.Group>
          <div className="text-right">
              <Button variant="primary" type="submit">
                Save
              </Button>
          </div>
      </Form>
    )
  }
}

export default ListItemForm;