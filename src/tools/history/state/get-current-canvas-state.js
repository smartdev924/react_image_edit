import { staticObjectConfig } from "../../../objects/static-object-config";
import { isText } from "../../../objects/utils/is-text";
import { fabricCanvas, state, tools } from "../../../state/utils";

export function getCurrentCanvasState(customProps = []) {
  customProps = [
    ...Object.keys(staticObjectConfig),
    "crossOrigin",
    "name",
    "displayName",
    "data",
    ...customProps,
  ];
  const canvas = fabricCanvas().toJSON(customProps);
  canvas.objects = canvas.objects
    .filter((obj) => !obj.data.internal)
    .map((obj) => {
      if (obj.type === "image" && state().config.crossOrigin) {
        obj.crossOrigin = "anonymous";
      }
      // text is not selectable/movable when saving
      // state without first moving the text object
      if (isText(obj)) {
        obj.selectable = true;
        obj.lockMovementX = false;
        obj.lockMovementY = false;
        obj.lockUniScaling = false;
      }
      // make sure there are no references to live objects
      return { ...obj, data: obj.data ? { ...obj.data } : {} };
    });

  return {
    canvas,
    editor: {
      zoom: state().zoom,
      activeObjectId: state().objects.active?.id || null,
    },
    canvasWidth: state().original.width,
    canvasHeight: state().original.height,
  };
}
