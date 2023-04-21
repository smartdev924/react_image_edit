import { randomString } from "@/utils/util_functions";
import { getCurrentCanvasState } from "./get-current-canvas-state";

export function createHistoryItem(params) {
  const state = params?.state || getCurrentCanvasState();
  return {
    ...state,
    name: params.name,
    id: randomString(15),
  };
}
