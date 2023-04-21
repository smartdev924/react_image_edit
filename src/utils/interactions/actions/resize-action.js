import { calcNewSizeFromAspectRatio } from "../utils/calc-new-size-from-aspect-ratio";

export class ResizeAction {
  callbackName = "onResize";
  resizeDir = null;

  matches(e) {
    const target = e.target;
    if (target.dataset.position) {
      this.resizeDir = target.dataset.position;
      return true;
    }
    return false;
  }

  execute(e, rect) {
    if (rect) {
      return this.resizeUsingRect(e, rect);
    }
    return this.resizeUsingEvent(e);
  }

  onPointerUp() {
    this.resizeDir = null;
  }

  resizeUsingEvent(e) {
    const prevRect = { ...e.currentRect };
    const newRect = { ...e.currentRect };
    const ratio = e.aspectRatio;

    if (this.resizeDir === "top-right") {
      newRect.width = Math.floor(newRect.width + e.deltaX);
      if (ratio) {
        newRect.height = Math.floor(newRect.width / ratio);
      } else {
        newRect.height = Math.floor(newRect.height - e.deltaY);
      }
      newRect.top = Math.floor(
        newRect.top + (prevRect.height - newRect.height)
      );
    } else if (this.resizeDir === "bottom-right") {
      newRect.width = Math.floor(newRect.width + e.deltaX);
      if (ratio) {
        newRect.height = Math.floor(newRect.width / ratio);
      } else {
        newRect.height = Math.floor(newRect.height + e.deltaY);
      }
    } else if (this.resizeDir === "top-left") {
      newRect.width = Math.floor(newRect.width - e.deltaX);
      if (ratio) {
        newRect.height = Math.floor(newRect.width / ratio);
      } else {
        newRect.height = Math.floor(newRect.height - e.deltaY);
      }
      newRect.left = Math.floor(
        newRect.left + (prevRect.width - newRect.width)
      );
      newRect.top = Math.floor(
        newRect.top + (prevRect.height - newRect.height)
      );
    } else if (this.resizeDir === "bottom-left") {
      newRect.width = Math.floor(newRect.width - e.deltaX);
      if (ratio) {
        newRect.height = Math.floor(newRect.width / ratio);
      } else {
        newRect.height = Math.floor(newRect.height + e.deltaY);
      }
      newRect.left = Math.floor(
        newRect.left + (prevRect.width - newRect.width)
      );
    }
    return newRect;
  }

  resizeUsingRect(e, newRect) {
    const currentRect = {
      ...e.currentRect,
      ...newRect,
    };
    if (e.aspectRatio) {
      const size = calcNewSizeFromAspectRatio(
        e.aspectRatio,
        currentRect.width,
        currentRect.height
      );
      currentRect.width = size.width;
      currentRect.height = size.height;
    }
    return currentRect;
  }
}
