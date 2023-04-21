import { useStore } from "./store";

export function state() {
  return useStore.getState();
}
/**
 * @returns {{ canvas: import("@/tools/canvas/image-canvas").ImageCanvas, objects: import("@/objects/object-tool").ObjectTool, zoom: import("@/tools/zoom-tool").ZoomTool, history: import("@/tools/history/history-tool").HistoryTool, filter: import("@/tools/filter/filter-tool").FilterTool, crop: import("@/tools/crop/crop-tool").CropTool, merge: import("@/tools/merge/merge-tool").MergeTool, text: import("@/tools/text/text-tool").TextTool, transform: import("@/tools/transform/transform-tool").TransformTool, import: import("@/tools/import/import-tool").ImportTool, export: import("@/tools/export/export-tool").ExportTool, brush: import("@/tools/brush/brush-tool").BrushTool }}
 */
export function tools() {
  return state().editor.tools;
}
/**
 * @returns {import("fabric").fabric.Canvas}
 */
export function fabricCanvas() {
  return state().fabric;
}

/**
 * @returns {HTMLCanvasElement}
 */
export function getEditCanvas() {
  return state().editCanvas;
}

/**
 * @returns {HTMLCanvasElement}
 */
export function getBgCanvas() {
  return state().bgCanvas;
}
