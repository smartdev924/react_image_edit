import { saveAs } from "file-saver";
import { toast } from "react-hot-toast";
import { fabricCanvas, state, tools } from "../../state/utils";
import { getCurrentCanvasState } from "../history/state/get-current-canvas-state";
import { b64toBlob } from "./b64-to-blob";
import { createImage } from "../brush/brush-tool";

export class ExportTool {
  /**
   * Primary "save" function. This is called when user clicks "Done" button in the toolbar.
   * It will apply watermark (if specified) and execute one of the actions below in the order of priority:
   *
   * 1. Send image data to url. If specified via "saveUrl" option in configuration.
   * 2. Execute "onSave" callback function. If provided in configuration.
   * 3. Download image or state file to user device with specified name, format and quality.
   */
  async save(name, format, quality) {
    const exportConfig = state().config.tools?.export;
    name = name || exportConfig?.defaultName;
    format = this.getFormat(format);
    quality = this.getQuality(quality);

    const filename = `${name}.${format}`;

    const data =
      format === "json"
        ? this.getJsonState()
        : await this.getDataUrl(format, quality);

    if (!data) return;

    if (state().config.saveUrl) {
      fetch(state().config.saveUrl, {
        method: "POST",
        body: JSON.stringify({ data, filename, format }),
      });
    } else if (state().config.onSave) {
      state().config.onSave?.(data, filename, format);
    } else {
      const blob = this.getCanvasBlob(format, data);
      saveAs(blob, filename);
    }
  }
  async saveWithWidthAndHeight(name, format, quality, width, height) {
    const exportConfig = state().config.tools?.export;
    name = name || exportConfig?.defaultName;
    format = this.getFormat(format);
    quality = this.getQuality(quality);

    const filename = `${name}.${format}`;

    const data =
      format === "json"
        ? this.getJsonState()
        : await this.getDataUrlWithWidthAndHeight(
            format,
            quality,
            width,
            height
          );

    if (!data) return;

    if (state().config.saveUrl) {
      fetch(state().config.saveUrl, {
        method: "POST",
        body: JSON.stringify({ data, filename, format }),
      });
    } else if (state().config.onSave) {
      state().config.onSave?.(data, filename, format);
    } else {
      const blob = this.getCanvasBlob(format, data);
      saveAs(blob, filename);
    }
  }
  /**
   * Returns base64 encoded data for current image.
   */
  getDataUrl(format, quality) {
    this.prepareCanvas();
    try {
      if (format === "svg") {
        return fabricCanvas().toSVG();
      }
      return fabricCanvas().toDataURL({
        format: this.getFormat(format),
        quality: this.getQuality(quality),
        multiplier: Math.max(
          state().original.width / fabricCanvas().width,
          state().original.height / fabricCanvas().height
        ),
      });
    } catch (e) {
      if (e.message.toLowerCase().includes("tainted")) {
        toast.error("Could not export canvas with external image.");
      }
    }
    return null;
  }
  async getDataUrlWithWidthAndHeight(format, quality, width, height) {
    this.prepareCanvas();
    try {
      if (format === "svg") {
        return fabricCanvas().toSVG();
      }
      const img = fabricCanvas();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;
      // Make Canvas Image background white
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);
      // Maintain aspect ratio of image & place in center of canvas
      const ratio = Math.min(width / img.width, height / img.height);
      const x = (width - img.width * ratio) / 2;
      const y = (height - img.height * ratio) / 2;
      return img.toDataURL({
        format: this.getFormat(format),
        quality: this.getQuality(quality),
        multiplier: Math.max(
          state().original.width / fabricCanvas().width,
          state().original.height / fabricCanvas().height
        ),
        width: width,
        height: height,
        left: x,
        top: y,
        enableRetinaScaling: true,
      });
    } catch (e) {
      if (e.message.toLowerCase().includes("tainted")) {
        toast.error("Could not export canvas with external image.");
      }
    }
    return null;
  }
  getCanvasBlob(format, data) {
    if (format === "json") {
      return new Blob([data], { type: "application/json" });
    }
    if (format === "svg") {
      return new Blob([data], { type: "image/svg+xml" });
    }
    const contentType = `image/${format}`;
    data = data.replace(/data:image\/([a-z]*)?;base64,/, "");
    return b64toBlob(data, contentType);
  }

  getJsonState() {
    return JSON.stringify(getCurrentCanvasState());
  }

  prepareCanvas() {
    fabricCanvas().discardActiveObject();
  }

  getFormat(format) {
    const config = state().config.tools?.export;
    format = format || config?.defaultFormat || "png";
    if (format === "jpg") format = "jpeg";
    return format;
  }

  getQuality(quality) {
    const config = state().config.tools?.export;
    quality = quality || config?.defaultQuality || 0.8;
    return quality;
  }
}
