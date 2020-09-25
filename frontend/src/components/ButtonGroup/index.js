import React, { Component } from "react";
import { Row, Col, Button } from "react-bootstrap";

/*
    Dynamically creates a horizontal row of buttons that fill their parent. 
*/
class ButtonGroup extends Component {

    constructor() {
        super();

        this.renderButtons = this.renderButtons.bind(this);
    }

    /*
        Render a button with the given data.
    */
    renderButton(data) {
        return (
            <Col key={data.name}>
                <Button block variant={data.color} onClick={data.onClick}>{data.name}</Button>
            </Col>
        );
    }

    /*
        An array of button data should be passed to the ButtonGroup
        in the following format:

        [
            {
                name: String
                color: String
                onClick: Function
            },
            ...
        ]
    */
    renderButtons() {
        if(!this.props.buttons) {
            return <div></div>;
        }
    
        return this.props.buttons.map(data => this.renderButton(data));
    }

    render() {
        return (
            <div className="mt-3">
                <Row>
                    { this.renderButtons() }
                </Row>
            </div>
        );
    }

}

export default ButtonGroup;
