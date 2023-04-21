import { fabricCanvas, state } from "../../state/utils";

export function canvasIsEmpty() {
  return (
    !state().config.image &&
    !state().config.blankCanvasSize &&
    (!fabricCanvas() || fabricCanvas().getObjects().length === 0)
  );
}
