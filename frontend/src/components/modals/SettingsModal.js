import React from "react";
import { Button, Form } from "react-bootstrap";
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
          <p>
            Exporting your room will bundle up all of your room data and save it
            as a JSON file. You can use this file as a backup, or you can send
            to others so that they can use it as a template.
          </p>

          <Button block onClick={props.onExport}>
            Export Room
          </Button>

          <hr />

          <p>
            Importing a room from a file will load layouts, properties, and
            items from a pre-existing room. However, any changes that you make
            will not affect the original room, only your copy.
          </p>

          <Button block onClick={props.onImport}>
            Import Room
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default SettingsModal;
