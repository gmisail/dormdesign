import React from 'react'

export default function Toolbar() {
    return (
        <div className="room-editor-toolbar">
          <div className="room-editor-toolbar-left">
            {editingBounds ? (
              boundaryPointSelected ? (
                <>
                  <div className="room-editor-point-viewer">
                    <div>
                      <input
                        value={selectedPointX}
                        type="number"
                        name="selectedPointX"
                        placeholder="X"
                        onChange={onPointInputChanged}
                      />
                      <input
                        value={selectedPointY}
                        type="number"
                        name="selectedPointY"
                        placeholder="Y"
                        onChange={onPointInputChanged}
                      />
                    </div>
                    <button
                      className="room-editor-point-delete-btn"
                      onClick={onClickDeleteSelectedPoint}
                      disabled={!canDeleteSelectedPoint}
                    >
                      Delete
                    </button>
                  </div>
                </>
              ) : null
            ) : (
              <>
                <IconButton
                  className="room-editor-toolbar-btn"
                  onClick={lockSelectedItem}
                  data-hidden={selectedItemID === null ? "true" : "false"}
                >
                  {locked ? <BiLockAlt /> : <BiLockOpenAlt />}
                </IconButton>
                <IconButton
                  className="room-editor-toolbar-btn"
                  onClick={rotateSelectedItem}
                  disabled={locked}
                  data-hidden={selectedItemID === null ? "true" : "false"}
                >
                  <RiClockwiseLine />
                </IconButton>
              </>
            )}
          </div>
          <div className="room-editor-toolbar-right">
            {editingBounds ? (
              <>
                <IconButton
                  className="room-editor-toolbar-btn room-editor-toolbar-btn-success"
                  onClick={() => {
                    toggleEditingBounds(true);
                  }}
                >
                  <BsCheck />
                </IconButton>
                <IconButton
                  className="room-editor-toolbar-btn room-editor-toolbar-btn-danger"
                  onClick={() => {
                    toggleEditingBounds(false);
                  }}
                >
                  <BsX />
                </IconButton>
              </>
            ) : (
              <IconButton
                className="room-editor-toolbar-btn"
                onClick={() => {
                  toggleEditingBounds();
                }}
                style={{ padding: "9px" }}
              >
                <BsBoundingBox />
              </IconButton>
            )}
          </div>
        </div>
    )
}
