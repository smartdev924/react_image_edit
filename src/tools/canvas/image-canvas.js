import { fabric } from "fabric";
import { ObjectName } from "../../objects/object-name";
import { staticObjectConfig } from "../../objects/static-object-config";
import { fabricCanvas, state, tools } from "../../state/utils";
import { fetchStateJsonFromUrl } from "../import/fetch-state-json-from-url";
import { canvasIsEmpty } from "./canvas-is-empty";
import { loadFabricImage } from "./load-fabric-image";
export class ImageCanvas {
  minWidth = 50;
  minHeight = 50;

  resize(width, height, { applyZoom = false, resizeHelper = true } = {}) {
    // tools().brush.resize(width, height);
    const currentZoom = state().zoom;
    fabricCanvas().setWidth(width * (applyZoom ? currentZoom : 1));
    fabricCanvas().setHeight(height * (applyZoom ? currentZoom : 1));
    state().setOriginal(width, height);
    if (resizeHelper) {
      tools().transform.resetStraightenAnchor();
    }
  }
  /**
   *
   * @param {string | fabric.Image} url
   * @param {string} loadStateName
   * @returns
   */
  async addMainImage(url, loadStateName = "mainImage") {
    let img;
    if (typeof url === "string") {
      state().toggleLoading(loadStateName);
      img = await loadFabricImage(url);
      if (!img) return;
    } else {
      img = url;
    }
    console.log(img);
    if (!state().replaced) {
      this.clear();
    } else {
      state().setConfig({ image: undefined, blankCanvasSize: undefined });
      tools().objects.delete(tools().objects.get(ObjectName.MainImage));
    }
    img.set(staticObjectConfig);
    img.name = ObjectName.MainImage;
    fabricCanvas().add(img);
    fabricCanvas().requestRenderAll();
    // }
    if (state().replaced) {
      tools().objects.sendToBack(img);
    }
    this.resize(img.width, img.height);
    img.center();
    img.setCoords();
    tools().zoom.fitToScreen();
    state().toggleLoading(false);
    state().config.onMainImageLoaded?.(img);
    if (state().replaced) {
      tools().history.addHistoryItem({ name: "replaceImage" });
    }
    return img;
  }

  openNew(width, height, bgColor) {
    width = Math.max(this.minWidth, width);
    height = Math.max(this.minHeight, height);

    if (!state().replaced) {
      this.clear();
    }
    this.resize(width, height);
    fabricCanvas().backgroundColor = bgColor;

    tools().zoom.fitToScreen();
    state().toggleLoading("newCanvas");
    requestAnimationFrame(() => {
      state().toggleLoading(false);
    });
    return Promise.resolve({ width, height });
  }

  /**
   * Get main image object, if it exists.
   */
  /**
   *
   * @returns {fabric.Image}
   */
  getMainImage() {
    // @ts-ignore
    return fabricCanvas()
      .getObjects()
      .find((obj) => obj.name === ObjectName.MainImage);
  }

  render() {
    fabricCanvas().requestRenderAll();
  }

  async loadInitialContent() {
    const image = state().config.image;
    const size = state().config.blankCanvasSize;
    const stateJson = state().config.state;
    if (image && image.endsWith("json")) {
      const stateObj = await fetchStateJsonFromUrl(image);
      await tools().import.loadState(stateObj);
    } else if (image && image.startsWith('{"canvas')) {
      await tools().import.loadState(image);
    } else if (image) {
      await this.addMainImage(image);
    } else if (stateJson) {
      await tools().import.loadState(stateJson);
    } else if (size) {
      await this.openNew(size.width, size.height);
    }
    if (canvasIsEmpty() && state().config.ui?.imageOverlay?.show) {
      state().togglePanel("newImage", true);
    }
    // delay adding initial so changes made in the returned promise are caught
    return new Promise((resolve) => {
      setTimeout(() => {
        tools().history.addInitial();
        resolve();
      }, 10);
    });
  }
  setBackgroundColor(color) {
    fabricCanvas().backgroundColor = color;
    fabricCanvas().requestRenderAll();
  }
  setGradientBackground(gradient) {
    fabricCanvas().backgroundColor = gradient;
    fabricCanvas().requestRenderAll();
  }
  setBackgroundPattern(pattern) {
    fabricCanvas().backgroundColor = pattern;
    fabricCanvas().requestRenderAll();
  }
  clear() {
    fabricCanvas().clear();
    tools().transform.resetStraightenAnchor();
  }
}
