import { state, tools } from "../../state/utils";
import { drawCropzone } from "./ui/cropzone/draw-cropzone";

export function calcNewSizeFromAspectRatio(aspectRatio, oldWidth, oldHeight) {
  let newWidth = oldWidth;
  let newHeight = oldHeight;

  if (aspectRatio) {
    if (oldHeight * aspectRatio > oldWidth) {
      newHeight = oldWidth / aspectRatio;
    } else {
      newWidth = oldHeight * aspectRatio;
    }
  }

  return { width: Math.floor(newWidth), height: Math.floor(newHeight) };
}

export function aspectRatioFromStr(ratio) {
  if (!ratio) return null;
  const parts = ratio.split(":");
  return parseInt(parts[0], 10) / parseInt(parts[1], 10);
}

export function centerWithinBoundary(boundary, aspectRatio = null) {
  // set rect to the size of specified boundary
  const rect = {
    width: boundary.width,
    height: boundary.height,
    top: 0,
    left: 0,
    angle: 0,
  };
  // maybe resize rect based on aspect ratio
  if (aspectRatio) {
    const newSize = calcNewSizeFromAspectRatio(
      aspectRatio,
      rect.width,
      rect.height
    );
    rect.width = newSize.width;
    rect.height = newSize.height;
  }
  // center the rect
  rect.left = (boundary.width - rect.width) / 2;
  rect.top = (boundary.height - rect.height) / 2;
  return rect;
}

export class CropTool {
  refs = null;
  zone;

  apply(box) {
    return tools()
      .merge.apply()
      .then(() => {
        // tools().brush.crop(box);
        tools().canvas.resize(Math.round(box.width), Math.round(box.height), {
          applyZoom: true,
          resizeHelper: true,
        });
        const img = tools().canvas.getMainImage();
        img.cropX = Math.round(box.left);
        img.cropY = Math.round(box.top);
        img.width = Math.round(box.width);
        img.height = Math.round(box.height);
        img.viewportCenter();

        tools().zoom.fitToScreen();
        tools().canvas.render();
        console.log("sdfasd");
        state().toggleLoading(false);
      });
  }

  drawZone(rect) {
    if (this.refs?.current) {
      state().crop.setCropzoneRect(rect);
      drawCropzone(rect, this.refs.current);
    }
  }

  resetCropzone(aspectRatioStr) {
    const boundaryRect = state().canvasSize;
    const aspectRatio = aspectRatioFromStr(aspectRatioStr);
    if (!boundaryRect) return;
    this.zone?.setConfig({ aspectRatio, boundaryRect });
    state().crop.setAspectRatio(aspectRatioStr);
    const newRect = centerWithinBoundary(boundaryRect, aspectRatio);
    this.drawZone(newRect);
  }

  registerRefs(refs) {
    this.refs = refs;
  }
}
