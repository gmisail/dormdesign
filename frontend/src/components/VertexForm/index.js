import React, { Component } from "react";
import { Form, Col, Button } from "react-bootstrap";
import Vector2 from "../../room-editor/Vector2";

class VertexForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      vertices: [new Vector2(0, 0), new Vector2(10, 0), new Vector2(10, 10)],
    };
  }

  onChange = (evt) => {
    let verts = this.state.vertices;
    let val = Math.max(0, evt.target.value);

    if (evt.target.id === "x") verts[evt.target.name].x = val;
    else if (evt.target.id === "y") verts[evt.target.name].y = val;

    this.setState({ vertices: verts });
    this.props.onUpdateLayout(verts);
  };

  onAddPoint = () => {
    let verts = this.state.vertices;
    verts.push(new Vector2(0, 0));

    this.setState({ vertices: verts });
    this.props.onUpdateLayout(verts);
  };

  render() {
    return (
      <div>
        {this.state.vertices.map((coord, idx) => (
          <Form.Row key={idx}>
            <Form.Group as={Col}>
              <Form.Control
                name={idx}
                id="x"
                onChange={this.onChange}
                className="col"
                type="number"
                value={coord.x}
              ></Form.Control>
            </Form.Group>

            <Form.Group as={Col}>
              <Form.Control
                name={idx}
                id="y"
                onChange={this.onChange}
                className="col"
                type="number"
                value={coord.y}
              ></Form.Control>
            </Form.Group>
          </Form.Row>
        ))}

        <Button onClick={this.onAddPoint}>Add Point</Button>
      </div>
    );
  }
}

export default VertexForm;
