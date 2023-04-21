// @ts-ignore
import { DEFAULT_SERIALIZED_EDITOR_STATE } from "./serialized-editor-state";
import { DEFAULT_OBJ_CONFIG } from "../../objects/default-obj-config";
import { isText } from "../../objects/utils/is-text";
import { fabricCanvas, state, tools } from "../../state/utils";
import { canvasIsEmpty } from "../canvas/canvas-is-empty";
import { TEXT_CONTROLS_PADDING } from "../text/text-tool";
import { createHistoryItem } from "./state/create-history-item";
import { defaultObjectProps } from "@/utils/initFabric";
import { ToolName } from "../tool-name";

export class HistoryTool {
  /**
   * Undo last canvas operation.
   */
  async undo() {
    if (state().activeTool === ToolName.ERASER) {
      if (tools().brush.canUndo()) {
        tools().brush.undoErasing();
        return;
      }
    }
    if (this.canUndo()) {
      const prev = state().history.items[state().history.pointer - 1];
      await this.load(prev);
    }
  }

  /**
   * Redo last canvas operation.
   */
  async redo() {
    if (this.canRedo()) {
      const next = state().history.items[state().history.pointer + 1];
      await this.load(next);
    }
  }

  /**
   * Check if there are any actions to undo.
   */
  canUndo() {
    if (state().activeTool === ToolName.ERASER) {
      return tools().brush.canUndo() || state().history.canUndo;
    }
    return state().history.canUndo;
  }

  /**
   * Check if there are any actions to redo.
   */
  canRedo() {
    return state().history.canRedo;
  }

  /**
   * Reload current history state, undoing any actions that were not yet applied.
   */
  reload() {
    return this.load(state().history.items[state().history.pointer]);
  }

  /**
   * Replace current history item with current canvas state.
   */
  replaceCurrent() {
    const current = state().history.items[state().history.pointer];
    const items = [...state().history.items];
    items[state().history.pointer] = createHistoryItem({
      name: current.name,
      state: current,
    });
  }

  /**
   * Create a new history item from current canvas state.
   */
  // @ts-ignore
  addHistoryItem(params) {
    const item = createHistoryItem(params);
    const stateUntilPointer = state().history.items.slice(
      0,
      state().history.pointer + 1
    );
    const newItems = [...stateUntilPointer, item];
    state().history.update(newItems.length - 1, newItems);
  }

  /**
   * Replace current canvas state with specified history item.
   */
  load(item) {
    item = { ...item, editor: item?.editor || DEFAULT_SERIALIZED_EDITOR_STATE };
    return new Promise((resolve) => {
      loadFonts(getUsedFonts(item.canvas.objects)).then(() => {
        fabricCanvas().loadFromJSON(item.canvas, () => {
          tools().zoom.set(1);

          // resize canvas if needed
          if (item.canvasWidth && item.canvasHeight) {
            tools().canvas.resize(item.canvasWidth, item.canvasHeight, {
              resizeHelper: false,
              applyZoom: false,
            });
          }

          tools().objects.syncObjects();

          // restore padding
          tools()
            .objects.getAll()
            .forEach((o) => {
              // translate left/top to center/center coordinates, for compatibility with old .json state files
              if (
                !o.data.internal &&
                o.originX === "left" &&
                o.originY === "top"
              ) {
                const point = o.getPointByOrigin("center", "center");
                o.set("left", point.x);
                o.set("top", point.y);
              }
              o.set({ ...DEFAULT_OBJ_CONFIG });
              if (o.type === "i-text") {
                o.set({
                  padding: TEXT_CONTROLS_PADDING,
                  lockMovementX: false,
                  lockMovementY: false,
                  ...defaultObjectProps,
                });
              }
            });

          // prepare fabric.js and canvas
          tools().canvas.render();
          fabricCanvas().calcOffset();
          tools().zoom.fitToScreen();

          // update pointer ID after state is applied to canvas
          state().history.updatePointerById(item.id);
          tools().transform.resetStraightenAnchor();
          resolve();
        });
      });
    });
  }

  /**
   * @hidden
   */
  addInitial(stateObj) {
    const initial = state().history.items.find((i) => i.name === "initial");
    if (!initial && (stateObj || !canvasIsEmpty())) {
      this.addHistoryItem({ name: "initial", state: stateObj });
    }
  }
}

export function isAbsoluteUrl(url = "") {
  if (!url) return false;
  return /^[a-zA-Z][a-zA-Z\d+\-.]*?:/.test(url);
}

export function assetUrl(uri = "") {
  if (!uri) return "";
  if (isAbsoluteUrl(uri)) {
    return uri;
  }
  const baseUrl = state().config.baseUrl ? `${state().config.baseUrl}/` : "";
  return `${baseUrl}${uri}`;
}

export function loadFonts(fonts) {
  const promises = fonts.map(async (fontConfig) => {
    const loadedFont = Array.from(document.fonts.values()).find((current) => {
      return current.family === fontConfig.family;
    });
    if (loadedFont) {
      return loadedFont.loaded;
    }
    const fontFace = new FontFace(
      fontConfig.family,
      `url(/assets/${fontConfig.src})`,
      fontConfig.descriptors
    );
    document.fonts.add(fontFace);
    return fontFace.load();
  });
  return Promise.all(promises);
}

function getUsedFonts(objects) {
  const fonts = [];
  objects.forEach((obj) => {
    if (!isText(obj)) return;
    const fontConfig = state().config.tools?.text?.items?.find(
      (f) => f.family === obj.fontFamily
    );
    if (fontConfig) {
      fonts.push(fontConfig);
    }
  });
  return fonts;
}
