import { ObjectName } from "@/objects/object-name";
import { useStore } from "@/state/store";
import { fabricCanvas, state, tools } from "@/state/utils";

export class ZoomTool {
  #maxZoom = 5;
  minZoom = 0.8;
  step = 0.01;

  get allowUserZoom() {
    return state().config?.tools?.zoom?.allowUserZoom ?? true;
  }

  get currentZoom() {
    return state().zoom;
  }

  constructor() {
    if (this.allowUserZoom) {
      this.bindMouseWheel();
    }

    useStore.subscribe(
      (s) => s.stageSize,
      () => {
        setTimeout(() => {
          this.fitToScreen();
        }, 1);
      }
    );
  }

  zoomIn(amount = this.step) {
    this.set(this.currentZoom + amount);
  }

  canZoomIn(amount = this.step) {
    return this.currentZoom + amount <= this.#maxZoom;
  }

  canZoomOut(amount = this.step) {
    return this.currentZoom - amount >= this.minZoom;
  }

  zoomOut(amount = this.step) {
    this.set(this.currentZoom - amount);
  }

  /**
   * Zoom canvas to specified scale.
   */
  set(newZoom, resize = true) {
    if (newZoom < this.minZoom || newZoom > this.#maxZoom) return;
    const width = Math.round(state().original.width * newZoom);
    const height = Math.round(state().original.height * newZoom);
    fabricCanvas().setZoom(newZoom);

    if (resize) {
      fabricCanvas().setDimensions({ width, height });
    }
    state().setZoom(newZoom);
  }

  /**
   * Resize canvas to fit available screen space.
   */
  fitToScreen() {
    if (!state().config.tools?.zoom?.fitImageToScreen) {
      return;
    }
    const { width, height } = state().stageSize;
    const stageHeight = Math.max(height, 1);
    const stageWidth = Math.max(width, 1);

    // image won't fit into current space available to canvas
    if (
      state().original.height > stageHeight ||
      state().original.width > stageWidth
    ) {
      const scale = Math.min(
        stageHeight / state().original.height,
        stageWidth / state().original.width
      );
      // no need to allow zooming out beyond maximum size that fits into canvas
      this.minZoom = Math.min(scale, 1);
      // image will fit, so we can just load it in original size
    } else {
      this.minZoom = 1;
    }

    this.set(this.minZoom);
  }

  bindMouseWheel() {
    fabricCanvas().on("mouse:wheel", (opt) => {
      opt.e.preventDefault();
      opt.e.stopPropagation();

      if (opt.e.deltaY < 0) {
        this.zoomIn(0.01);
      } else {
        this.zoomOut(0.01);
      }
    });
  }
}
