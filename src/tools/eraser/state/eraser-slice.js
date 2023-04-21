import { tools } from "@/state/utils";
import { castDraft } from "immer";

export const createEraserSlice = (set, get) => ({
  eraser: {
    ...eraserSliceDefaults,
    updateBrush: (width) => {
      set((state) => {
        state.eraser.brush = castDraft(width);
      });
    },
    addLastPoint: (point) => {
      set((state) => {
        state.eraser.lastPoint = castDraft(point);
      });
    },
    changeType: (type) => {
      set((state) => {
        state.eraser.type = castDraft(type);
      });
    },
    addImageData: (...data) => {
      set((state) => {
        state.eraser.data = [...get().eraser.data, data];
      });
    },
    convertedImageData: (data) => {
      set((state) => {
        state.eraser.converted = castDraft(data);
      });
    },
    reset: async () => {
      await tools().brush.reset();
      set({ eraser: { ...get().eraser, ...eraserSliceDefaults } });
    },
    setMask: (mask) => {
      set((state) => {
        state.eraser.mask = castDraft(mask);
      });
    },
    setFeathering: (feathering) => {
      set((state) => {
        state.eraser.feathering = castDraft(feathering);
      });
    },
    setOffset: (offset) => {
      set((state) => {
        state.eraser.offset = castDraft(offset);
      });
    },
    setOriginalImage: (image) => {
      set((state) => {
        state.eraser.image = castDraft(image);
      });
    },
    apply: async () => {
      get().editor.tools.brush.apply();
    },
  },
});

const eraserSliceDefaults = {
  brush: 10,
  data: [],
  lastPoint: [0, 0],
  type: "eraser",
  converted: null,
  moving: false,
  offset: 0,
  feathering: 0,
  mask: null,
  image: null,
};
