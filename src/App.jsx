import { DEFAULT_CONFIG, SELLER_IMAGE_VERSION } from "@/config/default-config";
import { setActiveTool } from "@/objects/bind-to-fabric-selection-events";
import { useStore } from "@/state/store";
import { state, tools } from "@/state/utils";
import { canvasIsEmpty } from "@/tools/canvas/canvas-is-empty";
import { getCurrentCanvasState } from "@/tools/history/state/get-current-canvas-state";
import { fetchStateJsonFromUrl } from "@/tools/import/fetch-state-json-from-url";
import { resetEditor } from "@/tools/import/import-tool";
import deepmerge from "deepmerge";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { toast } from "react-hot-toast";
import { mountStoreDevtool } from "simple-zustand-devtools";
import App from "./pages";
const root = ReactDOM.createRoot(document.getElementById("root"));
export class SellerImageEditor {
  tools = {};
  fabric = null;

  get state() {
    return state();
  }
  get version() {
    return SELLER_IMAGE_VERSION;
  }
  get defaultConfig() {
    return DEFAULT_CONFIG;
  }

  constructor(config) {
    this.setConfig(config);
    useStore.setState({ editor: this });
    if (process.env.NODE_ENV === "development") {
      mountStoreDevtool("Store", useStore);
    }
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }

  /**
   * Open editor.
   */
  open(config = {}) {
    if (state().config.ui?.visible) return;
    this.setConfig(deepmerge(config, { ui: { visible: true } }));
    requestAnimationFrame(() => {
      tools().zoom.fitToScreen();
      tools().history.addInitial();
      if (canvasIsEmpty() && state().config.ui?.openImageDialog?.show) {
        this.togglePanel("newImage", true);
      }
      state().config.onOpen?.();
    });
  }

  /**
   * Close editor.
   */
  close() {
    if (!state().config.ui?.visible) return;
    this.setConfig({ ui: { visible: false } });
    state().config.onClose?.();
  }

  /**
   * Override editor configuration.
   */
  setConfig(config) {
    state().setConfig(config);
  }

  /**
   * Open file upload window and add selected image to canvas.
   */
  uploadAndAddImage() {
    return tools().import.uploadAndAddImage();
  }

  /**
   * Open file upload window and replace canvas contents with selected image.
   */
  uploadAndReplaceMainImage() {
    return tools().import.uploadAndReplaceMainImage();
  }

  /**
   * Open file upload window and replace canvas contents with selected state file.
   */
  uploadAndOpenStateFile() {
    return tools().import.uploadAndOpenStateFile();
  }

  /**
   * Clear current canvas and open a new one at specified size.
   */
  newCanvas(width, height, bgColor) {
    return tools().canvas.openNew(width, height, bgColor);
  }

  /**
   * Get current canvas state as json string.
   */
  getState(customProps) {
    return JSON.stringify(getCurrentCanvasState(customProps));
  }

  setState(data) {
    return tools().import.loadState(data);
  }

  async setStateFromUrl(url) {
    const stateObj = await fetchStateJsonFromUrl(url);
    return tools().import.loadState(stateObj);
  }

  /**
   * Open specified tool (crop, draw, text etc.)
   */
  openTool(name) {
    setActiveTool(name);
  }

  /**
   * Apply any pending changes from currently open tool.
   * This is identical to clicking "apply" button in the editor.
   */
  applyChanges() {
    state().applyChanges();
  }

  /**
   * Cancel any pending changes from currently open tool.
   * This is identical to clicking "cancel" button in the editor.
   */
  cancelChanges() {
    state().cancelChanges();
  }

  /**
   * Fully reset editor state and optionally
   * override specified configuration.
   */
  async resetEditor(config) {
    await resetEditor(config);
    await tools().canvas.loadInitialContent();
  }

  /**
   * Toggle specified floating panel.
   */
  togglePanel(name, isOpen) {
    state().togglePanel(name, isOpen);
  }

  /**
   * Listen to specified canvas event.
   * (List of all available events can be found in the documentation)
   */
  // @ts-ignore
  on(event, handler) {
    this.fabric?.on(event, handler);
  }

  /**
   * Check if any modifications made to canvas have not been applied yet.
   */
  isDirty() {
    return state().dirty;
  }

  /**
   * @hidden
   */
  get(name) {
    return this.tools[name];
  }

  /**
   * Display specified notification message in the editor.
   */
  notify(message) {
    return toast(message);
  }

  /**
   * Create a new editor instance.
   */
  static init(config) {
    return new Promise((resolve) => {
      // console.log("Editor init");
      const userOnLoad = config?.onLoad;
      config.onLoad = (instance) => {
        // call user specified "onLoad" function"
        userOnLoad?.(instance);
        resolve(instance);
      };
      (() => new this(config))();
    });
  }
}
