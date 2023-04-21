import { createEraserSlice } from "@/tools/eraser/state/eraser-slice";
import produce, { castDraft } from "immer";
import { toast } from "react-hot-toast";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { DEFAULT_CONFIG } from "../config/default-config";
import { mergeConfig } from "../config/merge-config";
import { createObjectsSlice } from "../objects/state/objects-slice";
import { createCropSlice } from "../tools/crop/crop-slice";
import { createFilterSlice } from "../tools/filter/filter-slice";
import { createHistorySlice } from "../tools/history/state/history-slice";
import { ToolName } from "../tools/tool-name";
import { ActiveToolOverlay } from "./editor-state";
import { tools } from "./utils";
import { loadFabricImage } from "@/tools/canvas/load-fabric-image";

const EMPTY_PLAIN_RECT = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  width: 0,
  height: 0,
};

const immer = (config) => (set, get, api) =>
  config(
    (partial, replace) => {
      const nextState =
        typeof partial === "function" ? produce(partial) : partial;
      return set(nextState, replace);
    },
    get,
    api
  );

export const useStore = create(
  subscribeWithSelector(
    immer((set, get) => ({
      editor: null,
      fabric: null,
      config: DEFAULT_CONFIG,
      zoom: 1,
      dirty: false,
      original: {
        width: 1000,
        height: 1000,
      },
      stageSize: EMPTY_PLAIN_RECT,
      canvasSize: EMPTY_PLAIN_RECT,
      activeTool: null,
      activeToolOverlay: null,
      loading: false,
      replaced: false,
      panel: "default",
      bottomNav: false,
      init: false,
      id: null,
      originalImage: null,
      openPanels: {
        newImage: false,
        history: false,
        objects: false,
        export: false,
      },
      ...createHistorySlice(set, get),
      ...createObjectsSlice(set, get),
      ...createFilterSlice(set, get),
      ...createCropSlice(set, get),
      ...createEraserSlice(set, get),
      // actions
      setZoom: (newZoom) =>
        set((state) => {
          state.zoom = newZoom;
        }),
      setBottomNav: (bottomNav) =>
        set((state) => {
          state.bottomNav = bottomNav;
        }),
      setOriginal: (width, height) =>
        set((state) => {
          state.original = { width, height };
        }),
      setDirty: (isDirty) =>
        set((state) => {
          state.dirty = isDirty;
        }),
      toggleLoading: (isLoading) =>
        set((state) => {
          state.loading = isLoading;
        }),
      setReplaced: (replaced) =>
        set((state) => {
          state.replaced = replaced;
        }),
      setPanel: (panel) => {
        set((state) => {
          state.panel = panel;
        });
      },
      setStageSize: (size) =>
        set((state) => {
          state.stageSize = size;
        }),
      setCanvasSize: (size) =>
        set((state) => {
          state.canvasSize = size;
        }),
      setOriginalImage: (image) =>
        set((state) => {
          state.originalImage = image;
        }),
      setActiveTool: async (toolName, overlay) => {
        set((state) => {
          state.activeTool = toolName;
          state.activeToolOverlay = overlay;
        });
        if (toolName === ToolName.ERASER) {
          await tools().brush.drawImage();
        }
      },
      setConfig: (partialConfig) =>
        set((state) => {
          state.config = castDraft(mergeConfig(partialConfig, get().config));
        }),
      setImageId: (id) =>
        set((state) => {
          state.id = id;
        }),
      togglePanel: (panelName, isOpen) =>
        set((state) => {
          state.openPanels[panelName] = isOpen ?? !state.openPanels[panelName];
        }),

      applyChanges: async () => {
        let activeToolName = get().activeTool;
        if (get().activeToolOverlay === ActiveToolOverlay.Crop) {
          activeToolName = "crop";
        }
        if (activeToolName === ToolName.CHANGE_IMAGE) {
          const activeToolOverlay = get().activeToolOverlay;
          if (activeToolOverlay === ActiveToolOverlay.Crop) {
            activeToolName = "crop";
          } else if (activeToolOverlay === ActiveToolOverlay.Resize) {
            activeToolName = "resize";
          }
        }
        if (!activeToolName) return;

        // @ts-ignore
        const toolSlice = get()[activeToolName];

        const result = await toolSlice?.apply?.();

        set((state) => {
          state.dirty = false;
          state.activeTool = null;
          state.activeToolOverlay = null;
        });

        // allow tools to prevent history item addition
        if (result !== false) {
          get().editor.tools.history.addHistoryItem({ name: activeToolName });
        }
        if (activeToolName === ToolName.ERASER) return;
        toolSlice?.reset();
      },
      cancelChanges: async () => {
        const activeToolName = get().activeTool;
        if (!activeToolName) return;
        const wasDirty = get().dirty;
        set((state) => {
          state.dirty = false;
          state.activeTool = null;
          state.activeToolOverlay = null;
        });

        if (
          wasDirty &&
          get().editor.state.history.items.at(-1)?.name !== "replaceImage"
        ) {
          await get().editor.tools.history.reload();
        }

        // @ts-ignore
        const toolSlice = get()[activeToolName];
        // run reset after history is loaded so too state can perform any needed changes.
        // Removing straighten anchor for example.
        await toolSlice?.reset();
      },
      reset: () => {
        get().editor.tools.transform.resetStraightenAnchor();
        set({
          activeTool: null,
          activeToolOverlay: null,
          zoom: 1,
          dirty: false,
          loading: false,
          openPanels: {
            newImage: false,
            history: false,
            objects: false,
            export: false,
          },
        });
        get().history.reset();
        get().objects.reset();
        get().filter.reset();
        get().crop.reset();
      },
      setEraserMask: async (data) => {
        toast.loading("Uploading Image...", { id: "uploading" });
        const formData = new FormData();
        formData.append("image", data);
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://app.sellersimagepro.com/api", true);
        // xhr.setRequestHeader("x-api-key", "asd");
        xhr.send(formData);
        const resp = await xhrPromise(xhr);
        const res = JSON.parse(resp.response);
        if (res.filename) {
          set((state) => {
            state.id = res.filename;
            state.eraser.mask = `https://app.sellersimagepro.com/uploads/mask/${res.filename}.png`;
            state.eraser.image = `https://app.sellersimagepro.com/uploads/input/${res.filename}.jpg`;
          });
          toast.success("Image Uploaded!", { id: "uploading" });
          return res.filename;
        }
      },
    }))
  )
);

/**
 * @template {XMLHttpRequest} T
 * @param {T} xhr
 * @returns {Promise<T>}
 */
const xhrPromise = (xhr) => {
  return new Promise((resolve, reject) => {
    xhr.addEventListener("load", (x) => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr);
      } else {
        reject(xhr);
      }
    });
    xhr.addEventListener("error", () => reject(xhr));
  });
};
