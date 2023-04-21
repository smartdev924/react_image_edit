export class Interactable {
  doubleTapTimer = null;
  boundOnPointerDown;
  boundOnPointerUp;

  constructor(el, config) {
    this.boundOnPointerDown = this.onPointerDown.bind(this);
    this.boundOnPointerUp = this.onPointerUp.bind(this);
    this.el = el;
    this.config = config;
    el.addEventListener("pointerdown", this.boundOnPointerDown);
    el.addEventListener("pointerup", this.boundOnPointerUp);
    el.addEventListener("touchstart", this.boundOnPointerDown);
    el.addEventListener("touchend", this.boundOnPointerUp);
  }

  currentRect = {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
    angle: 0,
  };
  currentAction;
  initialAspectRatio = 0;
  lastPosition = { pageX: 0, pageY: 0 };

  get aspectRatio() {
    if (this.config.maintainInitialAspectRatio) {
      return this.initialAspectRatio;
    }
    if (this.config.aspectRatio) {
      return this.config.aspectRatio;
    }
    return null;
  }

  setConfig(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig,
    };
  }

  destroy() {
    this.el.removeEventListener("pointerdown", this.boundOnPointerDown);
    this.el.removeEventListener("pointerup", this.boundOnPointerUp);
    this.el.removeEventListener("touchstart", this.boundOnPointerDown);
    this.el.removeEventListener("touchend", this.boundOnPointerUp);
  }

  onPointerDown(e) {
    e.stopPropagation();
    e.preventDefault();
    this.lastPosition = { pageX: e.pageX, pageY: e.pageY };
    this.el.style.touchAction = "none";
    this.el.style.userSelect = "none";
    this.syncCurrentRectWithEl(this.el);

    this.currentAction = this.config.actions.find((a) => a.matches(e));
    if (this.currentAction) {
      this.currentRect = {
        ...this.currentRect,
        ...this.currentAction.onPointerDown?.(e),
      };
    }

    this.config.listeners.onPointerDown?.({ rect: this.currentRect });

    this.el.onpointermove = this.onPointerMove.bind(this);
    this.el.setPointerCapture(e.pointerId);
  }

  onPointerMove(e) {
    e.stopPropagation();
    e.preventDefault();

    if (this.currentAction) {
      this.executeAction(this.currentAction, e);
    }
    this.lastPosition = { pageX: e.pageX, pageY: e.pageY };
  }

  executeAction(action, e, extra) {
    const prevRect = { ...this.currentRect };
    this.currentRect = action.execute(
      {
        deltaX: e.pageX - this.lastPosition.pageX,
        deltaY: e.pageY - this.lastPosition.pageY,
        pageX: e.pageX,
        pageY: e.pageY,
        aspectRatio: this.aspectRatio,
        currentRect: this.currentRect,
      },
      extra
    );

    if (this.config.modifiers) {
      this.currentRect = this.config.modifiers.reduce(
        (rect, modifier) =>
          modifier({ currentRect: this.currentRect, prevRect }, this.config),
        this.currentRect
      );
    }

    const callback = this.config.listeners[action.callbackName];
    const payload = { rect: { ...this.currentRect }, prevRect };
    callback?.(payload);
  }

  syncCurrentRectWithEl(el) {
    const translateVal = el.style.transform.match(/translate\((.+?)\)/)?.[1];
    const [left = "0", top = "0"] = (translateVal || "").split(",");

    this.currentRect = {
      // use clientHeight to rotation transform is ignored, it does not include margin
      width: el.offsetWidth,
      height: el.offsetHeight,
      left: parseInt(left, 10),
      top: parseInt(top, 10),
      angle: 0,
    };
    this.initialAspectRatio = this.currentRect.width / this.currentRect.height;
  }

  onPointerUp(e) {
    e.stopPropagation();
    e.preventDefault();
    const currentTarget = e.currentTarget;
    this.currentAction = null;
    currentTarget.onpointermove = null;
    if (currentTarget.releasePointerCapture)
      currentTarget.releasePointerCapture(e.pointerId);
    this.config.actions.forEach((a) => a.onPointerUp?.(e));
    this.config.listeners.onPointerUp?.({ rect: this.currentRect });
    this.handleDoubleTap(e);
  }

  handleDoubleTap(e) {
    if (!this.doubleTapTimer) {
      this.doubleTapTimer = setTimeout(() => {
        this.doubleTapTimer = null;
      }, 300);
    } else {
      clearTimeout(this.doubleTapTimer);
      this.doubleTapTimer = null;
      this.config.listeners.onDoubleTap?.(e);
    }
  }
}
