import React from "react";
import { Button, Form } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import ChooseNameForm from "../ChooseNameForm/ChooseNameForm";
import VertexForm from "../VertexForm";

class SettingsModal extends React.Component {
  constructor() {
    super();

    this.state = {
      file: null,
    };

    this.onFileUploaded = this.onFileUploaded.bind(this);
    this.onImport = this.onImport.bind(this);
  }

  onFileUploaded = (evt) => {
    let file = evt.target.files[0];
    let type = file.type;

    if (type === "application/json") {
      this.setState({ file: file });
    } else {
      // error
    }
  };

  onImport = () => {
    if (this.state.file) {
      this.props.onImport(this.state.file);
    }
  };

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Settings</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <h5>Layout</h5>
            <VertexForm
              bounds={this.props.bounds}
              onUpdateLayout={this.props.onUpdateLayout}
            ></VertexForm>
            <hr />
            <h5>Export</h5>
            <p>
              Exporting your room will bundle up all of your room data and save
              it as a JSON file. You can use this file as a backup, or you can
              send to others so that they can use it as a template.
            </p>

            <Button onClick={this.props.onExport}>Export Room</Button>

            <hr />

            <h5>Import</h5>
            <p>
              Importing a room from a file will load layouts, properties, and
              items from a pre-existing room. However, any changes that you make
              will not affect the original room, only your copy.
            </p>
            <Form.Group>
              <Form.File
                className="position-relative"
                name="file"
                onChange={this.onFileUploaded}
              />
            </Form.Group>

            <Button onClick={this.onImport}>Import Room</Button>
          </Form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default SettingsModal;
