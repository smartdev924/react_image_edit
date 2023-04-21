import { castDraft } from "immer";

export const createHistorySlice = (set, get) => ({
  history: {
    ...historySliceDefaults,
    updatePointerById: (id) => {
      const index = get().history.items.findIndex((i) => i.id === id);
      get().history.update(index);
    },
    update: (pointer, items) => {
      set((state) => {
        state.history.pointer = pointer;
        if (items) {
          state.history.items = castDraft(items);
        }
        state.history.canUndo =
          state.history.pointer > 0 &&
          state.history.items.at(-1)?.name !== "replaceImage";
        state.history.canRedo =
          state.history.items.length > state.history.pointer + 1;
      });
    },
    reset: () => {
      set({ history: { ...get().history, ...historySliceDefaults } });
    },
  },
});

const historySliceDefaults = {
  items: [],
  pointer: 0,
  canUndo: false,
  canRedo: false,
};

/**
 * @typedef {ReturnType<createHistorySlice>["history"]} HistoryItem
 * @exports HistoryItem
 */
