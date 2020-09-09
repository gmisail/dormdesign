import React, { Component } from "react";
import { Card, ListGroup, Button } from "react-bootstrap";

class ListRoute extends Component {

    render() {
        return <div>
            <h2>My List</h2>
            <div className="mb-3">
                <ListGroup>
                    <ListGroup.Item>
                        <b>Soundbar or Speakers</b>
                        <div className="float-right">
                            <Button variant="secondary">Claim</Button>
                        </div>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <b>Television</b>
                        <i className="float-right">Johnny Appleseed</i>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <b>Floor lamp</b>
                        <i className="float-right">John Smith</i>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <span><b>Power strip</b> (2)</span>
                        <div className="float-right">
                            <Button variant="secondary">Claim</Button>
                        </div>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <span><b>LED strips</b> (4)</span>
                        <div className="float-right">
                            <Button variant="secondary">Claim</Button>
                        </div>
                    </ListGroup.Item>
                </ListGroup>
            </div>
        </div>
    }

}

export default ListRoute;