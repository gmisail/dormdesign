import React from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import ChooseNameForm from "../ChooseNameForm/ChooseNameForm";

const SettingsModal = (props) => {
  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <p>Little blurb of warning.</p>
          <Row>
            <Col>
              <Button block onClick={props.onExport}>
                Export Room
              </Button>
            </Col>

            <Col>
              <Button block onClick={props.onImport}>
                Import Room
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default SettingsModal;
