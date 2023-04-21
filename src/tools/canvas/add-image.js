import { ObjectName } from "@/objects/object-name";
import { fabricCanvas, state, tools } from "@/state/utils";
import { loadFabricImage } from "./load-fabric-image";

export async function addImage(
  url,
  fitToScreen = true,
  loadStateName = ObjectName.Image
) {
  const img = await loadFabricImage(url);
  if (!img) return;
  return new Promise((resolve) => {
    console.log("addImage");
    img.name = loadStateName;
    img.opacity = 0;
    // use either main image or canvas dimensions as outer boundaries for scaling new image
    const maxWidth = state().original.width;
    const maxHeight = state().original.height;

    // if image is wider or higher than the current canvas, we'll scale it down
    if (fitToScreen && (img.width >= maxWidth || img.height >= maxHeight)) {
      // calc new image dimensions (main image height - 10% and width - 10%)
      const newWidth = maxWidth - 0.1 * maxWidth;
      const newHeight = maxHeight - 0.1 * maxHeight;
      const scale =
        1 /
        Math.min(
          newHeight / img.getScaledHeight(),
          newWidth / img.getScaledWidth()
        );

      // scale newly uploaded image to the above dimensions
      img.scaleX *= 1 / scale;
      img.scaleY *= 1 / scale;
    }

    // center and render newly uploaded image on the canvas
    /**
     * @type {fabric.Canvas}
     */
    const fabric = fabricCanvas();
    fabric.add(img);
    img.viewportCenter();
    img.setCoords();
    fabric.requestRenderAll();
    tools().zoom.fitToScreen();
    tools().canvas.render();
    fabric.setActiveObject(img);

    img.animate("opacity", "1", {
      duration: 425,
      onChange: () => {
        fabric.requestRenderAll();
      },
      onComplete: () => {
        resolve(img);
      },
    });
  });
}
