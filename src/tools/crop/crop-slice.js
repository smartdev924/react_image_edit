export const createCropSlice = (set, get) => ({
  crop: {
    ...cropSliceDefaults,
    setCropzoneRect: (rect) => {
      set((state) => {
        state.crop.zoneRect = rect;
      });
    },
    setAspectRatio: (ratio) => {
      set((state) => {
        state.crop.selectedAspectRatio = ratio;
      });
    },
    setTransformAngle: (angle) => {
      set((state) => {
        state.crop.straightenAngle = angle;
      });
    },
    apply: async () => {
      const rect = get().crop.zoneRect;
      if (rect) {
        const scaledRect = {
          width: Math.ceil(rect.width / get().zoom),
          height: Math.ceil(rect.height / get().zoom),
          left: Math.ceil(rect.left / get().zoom),
          top: Math.ceil(rect.top / get().zoom),
        };
        await get().editor.tools.crop.apply(scaledRect);
        set({ crop: { ...get().crop, cropped: true } });
      }
    },
    reset: () => {
      set({ crop: { ...get().crop, ...cropSliceDefaults } });
    },
  },
});

const cropSliceDefaults = {
  zoneRect: null,
  selectedAspectRatio: null,
  straightenAngle: 0,
};
