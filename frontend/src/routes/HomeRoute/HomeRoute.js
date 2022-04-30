import "./HomeRoute.scss";

import React, { Component } from "react";

import { Link } from "react-router-dom";
import { BsX, BsLink45Deg, BsThreeDotsVertical } from "react-icons/bs";

import { ReactComponent as Logo } from "../../assets/logo.svg";

import DataRequests from "../../controllers/DataRequests";
import StorageController from "../../controllers/StorageController";

import RoomModel from "../../models/RoomModel";

import SingleInputForm from "../../components/SingleInputForm/SingleInputForm";
import DropdownMenu from "../../components/DropdownMenu/DrowndownMenu";
import RoomThumbnail from "../../components/RoomThumbnail/RoomThumbnail";
import RoomThumbnailGrid from "../../components/RoomThumbnailGrid/RoomThumbnailGrid";

import Vector2 from "../../room-editor/Vector2";
import RoomGridObject from "../../room-editor/RoomGridObject";
import SceneController from "../../room-editor/SceneController";

class HomeRoute extends Component {
  state = {
    joinRoomInput: "",
    showCreateRoomModal: false,
    showJoinRoomModal: false,
    roomHistory: [],
  };

  async componentDidMount() {
    document.title = "DormDesign";

    const roomHistory = StorageController.getRoomsFromHistory();
    this.setState({
      roomHistory: roomHistory,
    });

    const backgroundColor = "#f4f4f4";
    const scene = new SceneController(this.backgroundCanvasRef);
    scene.backgroundColor = backgroundColor;
    const grid = new RoomGridObject({
      scene: scene,
      lineColor: "#e0e0e0",
      lineWidth: 2,
      backgroundColor: backgroundColor,
    });
    scene.addChild(grid);

    this.scene = scene;
    this.grid = grid;

    this.fitGridToWindow();
    scene.onResize = this.fitGridToWindow;
  }

  fitGridToWindow = () => {
    this.grid.size = new Vector2(this.backgroundCanvasRef.width, this.backgroundCanvasRef.height);
    this.grid.cellSize = 80 * window.devicePixelRatio;
    this.grid.lineWidth = 2 * window.devicePixelRatio;
  };

  componentWillUnmount() {
    // Cleanup callback
    this.scene.onResize = () => {};
  }

  onSubmitCreateRoom = async (name) => {
    let roomID;
    try {
      const roomData = await DataRequests.createRoom(name);
      roomID = roomData.id;
      this.props.history.push(`/room/${roomID}`);
    } catch (err) {
      this.setState({ showCreateRoomModal: false });
      console.error(err);
      alert(err.message);
    }
  };

  onSubmitCloneRoom = async (templateId) => {
    let roomID;
    try {
      const roomData = await DataRequests.createRoom(undefined, templateId);
      roomID = roomData.id;
      this.props.history.push(`/room/${roomID}`);
    } catch (err) {
      this.setState({ showCreateRoomModal: false });
      console.error(err);
      alert(err.message);
    }
  };

  // Removes a recent room from local storage and from local state.
  // Takes in id of room and curent index of it in 'roomHistory' state variable
  removeRecentRoom = (id, index) => {
    const updated = StorageController.removeRoomFromHistory(id);
    // Only update the state if an element was actually removed
    if (updated.length !== this.state.roomHistory.length) {
      this.setState({
        roomHistory: this.state.roomHistory.filter((_, i) => i != index),
      });
    }
  };

  renderRecentRooms = () => {
    return (
      <div className="home-recent-rooms custom-card">
        <RoomThumbnailGrid header={<h5>Recent Rooms</h5>}>
          {this.state.roomHistory.map((item, index) => {
            return (
              <RoomThumbnail
                dropdownMenu={
                  <DropdownMenu placement={"bottom-start"} buttonIcon={<BsThreeDotsVertical />}>
                    <DropdownMenu.Item
                      icon={<BsLink45Deg />}
                      text={"Copy link"}
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/room/${item.id}`);
                      }}
                    />
                    <DropdownMenu.Item
                      icon={<BsX />}
                      text={"Hide"}
                      onClick={() => this.removeRecentRoom(item.id, index)}
                    />
                  </DropdownMenu>
                }
                key={index}
                name={item?.name ?? "Unkown Room"}
                id={item?.id ?? null}
              />
            );
          })}
        </RoomThumbnailGrid>
      </div>
    );
  };

  render() {
    return (
      <>
        <canvas ref={(ref) => (this.backgroundCanvasRef = ref)} id="background-canvas" />
        <div className="content-container">
          <div className="header-container">
            <Logo className="logo" />
          </div>
          <div className="home-card-create custom-card">
            <div>
              <h5>Create a Room</h5>
              <p>Start a room from scratch.</p>
            </div>
            <SingleInputForm
              placeholder="Room name"
              onSubmit={this.onSubmitCreateRoom}
              submitButtonText="Create"
              trim={true}
              maxLength={RoomModel.MAX_NAME_LENGTH}
            />
          </div>
          <div className="home-card-templates custom-card">
            <div>
              <h5>Clone a Template</h5>
              <p>Start from one of our featured templates.</p>
            </div>

            <Link to="/templates" className="custom-btn">
              Explore Templates
            </Link>
          </div>
          <div className="home-card-join custom-card">
            <div>
              <h5>Join an Existing Room</h5>
              <p>
                In order to modify a room, you need the room link. Ask someone with access to the
                room to share it with you.
              </p>
            </div>
          </div>
          {this.state.roomHistory.length > 0 ? this.renderRecentRooms() : null}
        </div>
      </>
    );
  }
}

export default HomeRoute;
