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
    this._pressed = false;
    this.position = null;

    this.onMouseDown = onMouseDown ?? (() => {});
    this.onMouseMove = onMouseMove ?? (() => {});
    this.onMouseUp = onMouseUp ?? (() => {});
    this.onScroll = onScroll ?? (() => {});

    this.watchedElement.addEventListener("touchstart", this._touchStart);
    this.watchedElement.addEventListener("touchend", this._touchEnd);
    this.watchedElement.addEventListener("touchmove", this._touchMove);

    this.watchedElement.addEventListener("mousedown", this._mouseDown);

    this.watchedElement.addEventListener("mousemove", this._mouseMove);
    this.watchedElement.addEventListener("wheel", this._wheel);

    this.watchedElement.addEventListener("mouseup", this._mouseUp);

    this.watchedElement.addEventListener("mouseleave", this._mouseLeave);
  }

  get pressed() {
    return this._pressed;
  }

  _mouseDown = (e) => {
    const rect = this.watchedElement.getBoundingClientRect();
    const position = new Vector2(
      (e.clientX - rect.left) * window.devicePixelRatio,
      (e.clientY - rect.top) * window.devicePixelRatio
    );
    this._pressed = true;
    this.position = position;
    this.onMouseDown(position);
  };

  _mouseMove = (e) => {
    const rect = this.watchedElement.getBoundingClientRect();
    const posX = (e.clientX - rect.left) * window.devicePixelRatio;
    const posY = (e.clientY - rect.top) * window.devicePixelRatio;
    let delta = null;
    if (this.position !== null) {
      delta = new Vector2(posX - this.position.x, posY - this.position.y);
    }
    this.position = new Vector2(posX, posY);

    this.onMouseMove(delta, this.position);
  };

  _mouseUp = (e) => {
    this._pressed = false;
    this.onMouseUp();
  };

  _mouseLeave = (e) => {
    if (this._pressed) {
      this._pressed = false;
      this.position = null;
      this.onMouseUp();
    }
  };

  _wheel = (e) => {
    e.preventDefault();
    const rect = this.watchedElement.getBoundingClientRect();
    const position = new Vector2(
      (e.clientX - rect.left) * window.devicePixelRatio,
      (e.clientY - rect.top) * window.devicePixelRatio
    );
    this.onScroll(e.deltaX, e.deltaY, position);
  };

  _touchStart = (e) => {
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    this.watchedElement.dispatchEvent(mouseEvent);
  };

  _touchMove = (e) => {
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    this.watchedElement.dispatchEvent(mouseEvent);
  };

  _touchEnd = (e) => {
    const mouseEvent = new MouseEvent("mouseup", {});
    this.watchedElement.dispatchEvent(mouseEvent);
  };
}

export default MouseController;
