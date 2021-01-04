import React, { Component } from "react";
import { Col, Form } from "react-bootstrap";
import { BsX } from "react-icons/bs";
import Vector2 from "../../room-editor/Vector2";
import IconButton from "../IconButton/IconButton";

import "./VertexForm.scss";

class VertexForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      vertices: [...props.bounds] ?? [], // Don't want to mutate original array that's passed in
    };
  }

  onChange = (evt) => {
    let verts = this.state.vertices;
    let value = evt.target.value;

    if (value.length !== 0) {
      value = parseFloat(value);
      console.log(value);
    }

    if (evt.target.name === "x") verts[evt.target.dataset.index].x = value;
    else if (evt.target.name === "y") verts[evt.target.dataset.index].y = value;

    this.setState({ vertices: verts });
  };

  onAddPoint = () => {
    let verts = this.state.vertices;
    verts.push(new Vector2(0, 0));

    this.setState({ vertices: verts });
  };

  onRemovePoint = (index) => {
    let verts = this.state.vertices;
    const updated = [];
    for (let i = 0; i < verts.length; i++) {
      if (i === index) continue;
      updated.push(verts[i]);
    }
    this.setState({ vertices: updated });
  };

  onFormSubmit = (event) => {
    event.preventDefault();
    this.props.onSubmit(this.state.vertices);
  };

  render() {
    return (
      <Form onSubmit={this.onFormSubmit}>
        <div className="vertices-container">
          {this.state.vertices.map((coord, idx) => (
            <Form.Row key={idx}>
              <Form.Group as={Col}>
                <Form.Control
                  name="x"
                  placeholder="X"
                  data-index={idx}
                  onChange={this.onChange}
                  className=""
                  type="number"
                  value={coord.x}
                  required
                ></Form.Control>
              </Form.Group>

              <Form.Group as={Col}>
                <Form.Control
                  name="y"
                  placeholder="Y"
                  data-index={idx}
                  onChange={this.onChange}
                  className=""
                  type="number"
                  value={coord.y}
                  required
                ></Form.Control>
              </Form.Group>
              <Form.Group
                as={Col}
                className="col-auto d-flex align-items-center pl-0"
              >
                <IconButton
                  type="button"
                  onClick={() => this.onRemovePoint(idx)}
                >
                  <BsX />
                </IconButton>
              </Form.Group>
            </Form.Row>
          ))}
        </div>

        <Form.Row className="justify-content-between">
          <Col>
            <div className="d-flex justify-content-between">
              <button
                className="custom-btn mr-2 custom-btn-secondary"
                type="button"
                onClick={this.onAddPoint}
              >
                Add Point
              </button>
              <button className="custom-btn" type="submit">
                Update
              </button>
            </div>
          </Col>
        </Form.Row>
      </Form>
    );
  }
}

export default VertexForm;
