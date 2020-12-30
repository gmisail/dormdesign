import Vector2 from "./Vector2";

class MouseController {
  constructor({
    watchedElement,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onScroll,
  }) {
    this.watchedElement = watchedElement;
    this.pressed = false;
    this._position = undefined;

    this.watchedElement.addEventListener(
      "touchstart",
      (e) => {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent("mousedown", {
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
        this.watchedElement.dispatchEvent(mouseEvent);
      },
      false
    );
    this.watchedElement.addEventListener(
      "touchend",
      (e) => {
        const mouseEvent = new MouseEvent("mouseup", {});
        this.watchedElement.dispatchEvent(mouseEvent);
      },
      false
    );
    this.watchedElement.addEventListener(
      "touchmove",
      (e) => {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent("mousemove", {
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
        this.watchedElement.dispatchEvent(mouseEvent);
      },
      false
    );

    this.watchedElement.addEventListener("mousedown", (e) => {
      const rect = this.watchedElement.getBoundingClientRect();
      const position = new Vector2(
        (e.clientX - rect.left) * window.devicePixelRatio,
        (e.clientY - rect.top) * window.devicePixelRatio
      );
      this.pressed = true;
      this._position = position;
      onMouseDown(position);
    });

    this.watchedElement.addEventListener("mousemove", (e) => {
      if (this.pressed) {
        const rect = this.watchedElement.getBoundingClientRect();
        const posX = (e.clientX - rect.left) * window.devicePixelRatio;
        const posY = (e.clientY - rect.top) * window.devicePixelRatio;
        const delta = new Vector2(
          posX - this._position.x,
          posY - this._position.y
        );
        this._position = new Vector2(posX, posY);
        onMouseMove(delta);
      }
    });
    this.watchedElement.addEventListener("wheel", (e) => {
      e.preventDefault();
      const rect = this.watchedElement.getBoundingClientRect();
      const position = new Vector2(
        (e.clientX - rect.left) * window.devicePixelRatio,
        (e.clientY - rect.top) * window.devicePixelRatio
      );
      onScroll(e.deltaX, e.deltaY, position);
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
}

export default MouseController;
