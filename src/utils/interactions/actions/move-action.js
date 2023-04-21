export class MoveAction {
  callbackName = "onMove";

  // this should persist between pointerup/down
  lockMovement = false;

  matches(e) {
    return !!e.target && !!e.currentTarget && e.target === e.currentTarget;
  }

  execute(e) {
    if (this.lockMovement) {
      return e.currentRect;
    }
    const newRect = e.currentRect;
    newRect.left += e.deltaX;
    newRect.top += e.deltaY;
    return newRect;
  }
}
