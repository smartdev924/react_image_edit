export const ROTATION_HANDLE_CLASS = "rotation-handle";

export class RotateAction {
  callbackName = "onRotate";

  centerX = 0;
  centerY = 0;
  startAngle = 0;

  matches(e) {
    const target = e.target;
    return target.classList.contains(ROTATION_HANDLE_CLASS);
  }

  onPointerDown(e) {
    const currentTarget = e.currentTarget;
    const rect = currentTarget.getBoundingClientRect();
    // store the center as the element has css `transform-origin: center center`
    this.centerX = rect.left + rect.width / 2;
    this.centerY = rect.top + rect.height / 2;

    const rotateVal =
      currentTarget.style.transform.match(/rotate\((.+?)\)/)?.[1];
    const [rotation = "0"] = rotateVal ? rotateVal.split(",") : [];
    this.startAngle = parseFloat(rotation);

    // get the angle of the element when the drag starts
    this.startAngle = this.getDragAngle(e);
    return { angle: this.startAngle };
  }

  onPointerUp() {
    this.centerX = 0;
    this.centerY = 0;
    this.startAngle = 0;
  }

  execute(e) {
    const newRect = { ...e.currentRect };

    newRect.angle = this.getDragAngle(e);
    newRect.left += e.deltaX;
    newRect.top += e.deltaY;

    return newRect;
  }

  getDragAngle(e) {
    const center = {
      x: this.centerX || 0,
      y: this.centerY || 0,
    };
    const angle = Math.atan2(center.y - e.pageY, center.x - e.pageX);

    return angle - (this.startAngle || 0);
  }
}
