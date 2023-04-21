import { initFabric } from "@/utils/initFabric";
import { ObjectTool } from "../objects/object-tool";
import { useStore } from "../state/store";
import { state } from "../state/utils";
import { ImageCanvas } from "./canvas/image-canvas";
import { CropTool } from "./crop/crop-tool";
import { ExportTool } from "./export/export-tool";
import { FilterTool } from "./filter/filter-tool";
import { HistoryTool } from "./history/history-tool";
import { ImportTool } from "./import/import-tool";
import { MergeTool } from "./merge/merge-tool";
import { TextTool } from "./text/text-tool";
import { TransformTool } from "./transform/transform-tool";
import { ZoomTool } from "./zoom-tool";
import { BrushTool } from "./brush/brush-tool";

/**
 *
 * @param {HTMLCanvasElement} canvasEl
 * @param {HTMLCanvasElement} editCanvas
 * @param {HTMLCanvasElement} bgCanvas
 */
export function initTools(canvasEl, editCanvas, bgCanvas) {
  const fabric = initFabric(canvasEl);
  state().editor.fabric = fabric;
  useStore.setState({ fabric, init: true, editCanvas, bgCanvas });
  state().editor.tools = {
    canvas: new ImageCanvas(),
    objects: new ObjectTool(),
    zoom: new ZoomTool(),
    history: new HistoryTool(),
    filter: new FilterTool(),
    crop: new CropTool(),
    merge: new MergeTool(),
    text: new TextTool(),
    transform: new TransformTool(),
    import: new ImportTool(),
    export: new ExportTool(),
    brush: new BrushTool(),
  };
}
