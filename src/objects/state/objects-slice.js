import { castDraft } from "immer";
import { isImage } from "../utils/is-image";
import { isText } from "../utils/is-text";
import { DEFAULT_ACTIVE_OBJ_PROPS } from "./default-active-obj-props";
import { fabricObjToState } from "./fabric-obj-to-state";

export const createObjectsSlice = (set, get) => ({
  objects: {
    ...objectsSliceDefaults,
    setActiveIsMoving: (value) => {
      set((state) => {
        state.objects.active.isMoving = value;
      });
    },
    setIsEditingText: (value) => {
      set((state) => {
        state.objects.isEditingText = value;
      });
    },
    setActive: (obj) => {
      if (obj) {
        set((state) => {
          state.objects.active.editableProps = castDraft(fabricObjToState(obj));
          state.objects.active.id = obj.data.id;
          state.objects.active.name = obj.name ?? null;
          state.objects.active.isText = isText(obj);
          state.objects.active.isImage = isImage(obj);
        });
      } else {
        set((state) => {
          const defaultEditableProps = {
            ...get().config.objectDefaults?.global,
            fontFamily: get().config.objectDefaults?.text?.fontFamily,
            fontSize: get().config.objectDefaults?.text?.fontSize,
            fontWeight: get().config.objectDefaults?.text?.fontWeight,
          };
          state.objects.active = {
            ...DEFAULT_ACTIVE_OBJ_PROPS,
            editableProps: defaultEditableProps,
          };
        });
      }
    },
    reset() {
      set({ objects: { ...get().objects, ...objectsSliceDefaults } });
    },
  },
});

const objectsSliceDefaults = {
  all: [],
  isEditingText: false,
  active: DEFAULT_ACTIVE_OBJ_PROPS,
};
