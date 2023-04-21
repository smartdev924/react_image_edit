import { ActiveToolOverlay } from "../../state/editor-state";

export const createFilterSlice = (set, get) => ({
  filter: {
    ...filterSliceDefaults,
    select(filterName, hasOptions = false) {
      set((state) => {
        state.filter.selected = filterName;
        state.activeToolOverlay = hasOptions ? ActiveToolOverlay.Filter : null;
        state.dirty = true;
      });
    },
    deselect(filterName) {
      if (get().filter.selected === filterName) {
        set((state) => {
          state.filter.selected = null;
          state.activeToolOverlay = null;
          state.dirty = true;
        });
      }
    },
    reset() {
      set({ filter: { ...get().filter, ...filterSliceDefaults } });
    },
  },
});

const filterSliceDefaults = {
  selected: null,
  applied: [],
};
