import Vector2 from "./Vector2";

class MouseController {
  constructor({ watchedElement, onMouseDown, onMouseMove, onMouseUp }) {
    this.watchedElement = watchedElement;
    this.pressed = false;
    this._position = undefined;

    this.watchedElement.addEventListener("mousedown", (e) => {
      //const position = this._getCursorPosition(this.watchedElement, e);
      const position = new Vector2(
        e.offsetX * window.devicePixelRatio,
        e.offsetY * window.devicePixelRatio
      );
      this.pressed = true;
      this._position = position;
      onMouseDown(position);
    });

    this.watchedElement.addEventListener("mousemove", (e) => {
      if (this.pressed) {
        const delta = new Vector2(
          e.offsetX * window.devicePixelRatio - this._position.x,
          e.offsetY * window.devicePixelRatio - this._position.y
        );
        this._position = new Vector2(
          e.offsetX * window.devicePixelRatio,
          e.offsetY * window.devicePixelRatio
        );
        onMouseMove(delta);
      }
    });

    this.watchedElement.addEventListener("mouseup", () => {
      this.pressed = false;
      onMouseUp();
    });

    this.watchedElement.addEventListener("mouseleave", () => {
      if (this.pressed) {
        this.pressed = false;
        onMouseUp();
      }
    });
  }

  // _getCursorPosition(canvas, event) {
  //   const rect = canvas.getBoundingClientRect();
  //   const x = event.clientX - rect.left;
  //   const y = event.clientY - rect.top;
  //   return { x: x, y: y };
  // }
}

export default MouseController;
