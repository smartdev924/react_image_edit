import { fabric } from "fabric";
import { state } from "../../state/utils";
/**
 *
 * @param {string} data
 * @returns {Promise<fabric.Image>}
 */
export function loadFabricImage(data) {
  return new Promise((resolve) => {
    fabric.Image.fromURL(data, resolve, {
      crossOrigin: "anonymous",
      hasControls: false,
      hasBorders: false,
      selectable: false,
      lockMovementX: true,
      lockMovementY: true,
    });
  });
}
