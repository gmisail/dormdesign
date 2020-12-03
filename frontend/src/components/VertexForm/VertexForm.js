import React, { Component } from "react";
import { Button, Col, Form } from "react-bootstrap";
import Vector2 from "../../room-editor/Vector2";

class VertexForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      vertices: props.bounds ?? [],
    };
  }

  onChange = (evt) => {
    let verts = this.state.vertices;

    let value = evt.target.value;
    if (value.length !== 0) {
      value = Math.max(0, value);
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

  onFormSubmit = (event) => {
    event.preventDefault();
    this.props.onSubmit(this.state.vertices);
  };

  render() {
    return (
      <Form onSubmit={this.onFormSubmit}>
        {this.state.vertices.map((coord, idx) => (
          <Form.Row key={idx}>
            <Form.Group as={Col}>
              <Form.Control
                name="x"
                placeholder="X"
                data-index={idx}
                onChange={this.onChange}
                className="col"
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
                className="col"
                type="number"
                value={coord.y}
                required
              ></Form.Control>
            </Form.Group>
          </Form.Row>
        ))}
        <Form.Row className="justify-content-between">
          <Col>
            <div className="d-flex justify-content-between">
              <button
                className="custom-btn mr-2 custom-btn-secondary"
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
