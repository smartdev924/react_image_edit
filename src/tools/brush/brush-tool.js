import { toast } from "react-hot-toast";
import {
  state,
  tools,
  getEditCanvas,
  getBgCanvas,
  fabricCanvas,
} from "../../state/utils";
import { loadFabricImage } from "../canvas/load-fabric-image";
const cursor =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAW9JREFUSEvFly1Tw0AQhp+VYLFg0VgsWLBoLA4GBxo0roNrLZbaIMGCpLb8hlaGefMxaY6EuTSX3M7E3e6ze7fZD8NXUo6AQ2Af2AUOCtUlsAJ+gG+MLx+T9u+hNAOcAKcFzMemnEiANyxzqFHawSnHwEUHoAsQdIbx2URuBqcZUFGGkATjxTX0F5xyCVm0IeUdY7ZpsA4OG6nreC3yCpy/qaIdUiblm+fgPHsfeiSSr7NKuHtlewk+B858tXuem2O8luAnYKenQV/1FcaNkVekK1+tQOcmAof8Z339SgS+LWqwr1KIcwuBH4G9ENY62FgK/NxBIdjRqOBoVx0tuaL9TpEKSN4kxiyZa4zr6E1CbVHZPXSjWAN3VVvMr3uMt3YGgbIeDdswsj5cosYa9j4wpu3D3jCR1yJtj7iC6801/G2bcEqkabeBvoIr2zXY6/N1QECtMBpnt1hh3AZYLW1a1uTE5tImmJa3RVuErrlfChtgMUeQA88AAAAASUVORK5CYII=";
/**
 *
 * @param {string} url
 * @param {import("react").HTMLAttributes<HTMLImageElement>} options
 * @returns {Promise<HTMLImageElement>}
 */
export const createImage = async (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
    if (options) {
      Object.keys(options).forEach((key) => {
        img[key] = options[key];
      });
    }
  });
};
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class BrushTool {
  /**
   * @type {Worker}
   */
  worker = null;
  constructor() {
    this.tempCanvas = document.createElement("canvas");
    this.isErasing = false;
    this.erasingData = [];
    this.redoData = [];
    this.lastPoint = [];
    this.mask = null;
    this.image = null;
    this.box = { width: 0, height: 0, left: 0, top: 0 };
    this.lastBox = { width: 0, height: 0, left: 0, top: 0 };
    this.dimension = { width: 0, height: 0 };
    this.originalImage = null;
  }
  get bgCanvas() {
    return getBgCanvas();
  }
  get editCanvas() {
    return getEditCanvas();
  }
  setFeathering(feathering) {
    state().setDirty(true);
    state().eraser.setFeathering(feathering);
    this.drawOverlappingWithOriginalMask();
  }
  setOffset(offset) {
    state().setDirty(true);
    state().eraser.setOffset(offset);
    this.drawOverlappingWithOriginalMask();
  }
  setOriginalImage(image) {
    this.originalImage = image;
    state().eraser.setOriginalImage(image);
  }
  /**
   *
   * @param {HTMLCanvasElement} canvas
   */
  initCanvasWorker(canvas) {
    if (this.worker) this.worker.terminate();
    this.worker = new Worker("/worker/mask.js");
    console.log(this.worker);
    this.worker.onmessage = async (event) => {
      if (event.data.status === "complete") {
        console.log("complete");
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = this.editCanvas.width;
        tempCanvas.height = this.editCanvas.height;
        const ctx = tempCanvas.getContext("2d");
        ctx.putImageData(event.data.imageData, 0, 0);
        await this.drawMask(tempCanvas);
        state().toggleLoading(false);
      } else {
        toast.error("Something went wrong");
      }
    };
    this.worker.onerror = (event) => {
      toast.error("Something went wrong");
    };
    const ctx = canvas.getContext("2d");
    const { feathering, offset } = state().eraser;
    console.log(feathering, offset);
    this.worker.postMessage({
      imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
      width: canvas.width,
      height: canvas.height,
      feathering,
      offset,
    });
  }
  async drawImage() {
    const img = await createImage(state().eraser.image, {
      // @ts-ignore
      crossOrigin: "anonymous",
    });
    await wait(100);
    this.image = img;
    const { width: imageWidth, height: imageHeight } = state().original;
    const { width: stageWidth, height: stageHeight } = state().stageSize;
    // 1. Check if image is bigger than stage
    const isBiggerThanStage =
      imageWidth > stageWidth || imageHeight > stageHeight;
    // 2. If bigger, resize the width & height & maintain aspect ratio
    let width = imageWidth;
    let height = imageHeight;
    if (isBiggerThanStage) {
      const ratio = imageWidth / imageHeight;
      if (ratio > 1) {
        width = stageWidth;
        height = width / ratio;
      } else {
        height = stageHeight;
        width = height * ratio;
      }
    }
    // 3. Set canvas width & height
    this.editCanvas.width = width;
    this.editCanvas.height = height;
    this.bgCanvas.width = width;
    this.bgCanvas.height = height;
    this.tempCanvas.width = width;
    this.tempCanvas.height = height;
    this.box = { width, height, left: 0, top: 0 };
    this.dimension = { width, height };
    let ctx = this.editCanvas.getContext("2d");
    console.log(img);
    ctx.drawImage(img, 0, 0, this.editCanvas.width, this.editCanvas.height);
    this.setBrushWidth(state().eraser.brush);
    const image = await createImage(state().eraser.mask, {
      //@ts-ignore
      crossOrigin: "anonymous",
    });
    state().setDirty(true);
    this.initCanvasWorker(this.bgCanvas);
    await this.drawMask(image);
  }
  async drawOverlappingWithOriginalMask() {
    state().toggleLoading("drawImage");
    const canvas = document.createElement("canvas");
    canvas.width = this.editCanvas.width;
    canvas.height = this.editCanvas.height;
    const ctx = canvas.getContext("2d");
    const image = await createImage(state().eraser.mask, {
      //@ts-ignore
      crossOrigin: "anonymous",
    });
    await this.drawMask(image, canvas);
    if (this.erasingData.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = "rgb(96, 231, 84)";
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.moveTo(this.erasingData[0]?.[0] || 0, this.erasingData[0]?.[1] || 0);
      for (var i = 1; i < this.erasingData.length; i++) {
        if (this.erasingData[i]) {
          ctx.lineWidth = this.erasingData[i][2];
          if (this.erasingData[i][3]) {
            ctx.globalCompositeOperation = "destination-out";
          } else ctx.globalCompositeOperation = "source-over";
          ctx.lineTo(this.erasingData[i][0], this.erasingData[i][1]);
        }
      }
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    }
    this.initCanvasWorker(canvas);
  }

  async drawMask(image, canvas = this.bgCanvas) {
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const threshold = 80;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const red = imageData.data[i];
      const green = imageData.data[i + 1];
      const blue = imageData.data[i + 2];
      const grayscale = (red + green + blue) / 3;
      //if color is black, remove. if not, set color.
      if (grayscale < threshold) {
        imageData.data[i + 3] = 0;
      } else {
        imageData.data[i] = 96;
        imageData.data[i + 1] = 231;
        imageData.data[i + 2] = 84;
      }
    }
    context.putImageData(imageData, 0, 0);
    const img = await createImage(canvas.toDataURL());
    await this.drawOverlaping();
    this.mask = img;
  }
  startErasing(e) {
    this.isErasing = true;
    state().setDirty(true);
    const context = this.bgCanvas.getContext("2d");
    context.strokeStyle = "rgb(96, 231, 84)";
    context.globalCompositeOperation = "source-over";
    context.lineJoin = "round";
    context.lineCap = "round";
    const rect = e.target.getBoundingClientRect();
    const x = e?.nativeEvent?.offsetX || e.clientX - rect.left;
    const y = e?.nativeEvent?.offsetY || e.clientY - rect.top;
    this.lastPoint = [x, y];
    if (state().eraser.type === "restore") {
      context.globalCompositeOperation = "destination-out";
    }
    context.beginPath();
    context.moveTo(x, y);
    context.lineWidth = state().eraser.brush;
    context.lineTo(x + 0.1, y + 0.1);
    context.stroke();
    if (
      this.erasingData.length > 0 &&
      this.erasingData[this.erasingData.length - 1] !== null
    ) {
      this.erasingData = [
        ...this.erasingData,
        null,
        [x, y, state().eraser.brush, state().eraser.type === "restore"],
      ];
    } else {
      this.erasingData = [
        ...this.erasingData,
        [x, y, state().eraser.brush, state().eraser.type === "restore"],
      ];
    }
  }
  async drawOverlaping() {
    /**
     * @type {import("@/tools/history/state/history-slice").HistoryItem}
     */
    const history = state().history;
    // Check if the history until the pointer has crop
    const hasCrop = history.items
      .slice(0, history.pointer + 1)
      .some((item) => item.name === "crop");
    // If has crop, draw the original image
    if (hasCrop) {
      toast.error("Cannot draw image after crop");
      return;
    }
    state().setReplaced(true);
    const canvas = document.createElement("canvas");
    const [height, width] = [this.editCanvas.height, this.editCanvas.width];
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(this.bgCanvas, 0, 0, width, height);
    ctx.globalCompositeOperation = "source-in";
    ctx.drawImage(this.editCanvas, 0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
    state().setReplaced(true);
    await tools().canvas.addMainImage(canvas.toDataURL(), "drawImage");
  }
  stopErasing() {
    this.isErasing = false;
    this.lastPoint = null;
    this.drawOverlaping();
  }
  erase(e) {
    if (!this.isErasing) return;
    const lastPoint = this.lastPoint;
    const context = this.bgCanvas.getContext("2d");
    const rect = e.target.getBoundingClientRect();
    const x = e?.nativeEvent?.offsetX || e.clientX - rect.left;
    const y = e?.nativeEvent?.offsetY || e.clientY - rect.top;
    const newPoint = [x, y];

    const distance = Math.sqrt(
      Math.pow(newPoint[0] - lastPoint[0], 2) +
        Math.pow(newPoint[1] - lastPoint[1], 2)
    );
    const angle = Math.atan2(
      newPoint[1] - lastPoint[1],
      newPoint[0] - lastPoint[0]
    );

    const steps = Math.ceil(distance / 2);
    for (let i = 0; i < steps; i++) {
      const newX = lastPoint[0] + Math.cos(angle) * distance * (i / steps);
      const newY = lastPoint[1] + Math.sin(angle) * distance * (i / steps);
      context.lineTo(newX, newY);
      context.stroke();
      this.lastPoint = [newX, newY];
      this.erasingData = [
        ...this.erasingData,
        [newX, newY, state().eraser.brush, state().eraser.type === "restore"],
      ];
    }
  }
  undoDraw(state = "redraw") {
    const canvas = this.bgCanvas;
    const context = canvas.getContext("2d");
    const editCanvas = this.editCanvas;
    const editCtx = editCanvas.getContext("2d");
    const tempCanvas = this.tempCanvas;
    tempCanvas.width = this.editCanvas.width;
    tempCanvas.height = this.editCanvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    const erasingData = this.erasingData;
    if (erasingData.length > 0 || true) {
      if (state === "undo") {
        while (erasingData.length) {
          const lastLine = erasingData.pop();
          if (lastLine === null) {
            break;
          }
        }
      } else if (state === "redo") {
        console.log("redo");
      }
      const width = this.dimension.width;
      const height = this.dimension.height;
      editCtx.clearRect(0, 0, this.editCanvas.width, this.editCanvas.height);
      // editCtx.save();
      // editCtx.translate(this.editCanvas.width / 2, this.editCanvas.height / 2);
      context.clearRect(0, 0, this.editCanvas.width, this.editCanvas.height);
      // context.save();
      // context.translate(this.editCanvas.width / 2, this.editCanvas.height / 2);

      if (this.mask) {
        tempCtx.clearRect(0, 0, width, height);
        document.body.appendChild(this.mask);
        tempCtx.drawImage(this.mask, 0, 0, tempCanvas.width, tempCanvas.height);
      } else {
        tempCtx.clearRect(0, 0, width, height);
      }
      // tempCtx.save();
      tempCtx.strokeStyle = "rgb(96, 231, 84)";
      tempCtx.lineJoin = "round";
      tempCtx.lineCap = "round";
      if (erasingData[0]) {
        tempCtx.globalCompositeOperation = erasingData[0][3]
          ? "destination-out"
          : "source-over";
        tempCtx.lineWidth = erasingData[0][2] * 1;
        tempCtx.beginPath();
        tempCtx.lineTo(erasingData[0][0] + 0.1, erasingData[0][1] + 0.1);
      }
      let tleft = 0;
      let ttop = 0;
      for (let i = 1; i < erasingData.length; i++) {
        if (erasingData[i] === null) {
          tempCtx.stroke();
          tempCtx.beginPath();
        } else if (
          typeof erasingData[i] === "string" ||
          erasingData[i] instanceof String
        ) {
          // if (erasingData[i] === "rotateLeft") {
          //   context.rotate(-Math.PI / 2);
          //   editCtx.rotate(-Math.PI / 2);
          //   tempCtx.rotate(Math.PI / 2);
          // } else if (erasingData[i] === "rotateRight") {
          //   context.rotate(Math.PI / 2);
          //   editCtx.rotate(Math.PI / 2);
          //   tempCtx.rotate(-Math.PI / 2);
          // } else if (erasingData[i] === "flipX") {
          //   context.scale(-1, 1);
          //   editCtx.scale(-1, 1);
          //   tempCtx.scale(1, -1);
          // } else if (erasingData[i] === "flipY") {
          //   context.scale(1, -1);
          //   editCtx.scale(1, -1);
          //   tempCtx.scale(-1, 1);
          // } else {
          //   const crop = JSON.parse(erasingData[i]);
          //   tleft += crop.left;
          //   ttop += crop.top;
          //   if (state === "undo") {
          //     console.log(crop);
          //     this.lastBox = crop;
          //   }
          // }
          tempCtx.stroke();
          tempCtx.beginPath();
        } else {
          tempCtx.globalCompositeOperation = erasingData[i][3]
            ? "destination-out"
            : "source-over";
          tempCtx.lineWidth = erasingData[i][2] * 1;
          tempCtx.lineTo(erasingData[i][0] + tleft, erasingData[i][1] + ttop);
        }
      }
      if (erasingData.length) tempCtx.stroke();
      tempCtx.restore();
      // let twidth,
      //   theight = 0;
      // if (this.box.width === this.editCanvas.width) {
      //   twidth = this.editCanvas.width;
      //   theight = this.editCanvas.height;
      // } else {
      //   theight = this.editCanvas.width;
      //   twidth = this.editCanvas.height;
      // }
      console.log("draw", this.box);
      context.drawImage(
        tempCanvas,
        this.box.left,
        this.box.top,
        this.box.width,
        this.box.height
        // -twidth / 2,
        // -theight / 2,
        // twidth,
        // theight
      );
      context.restore();
      editCtx.drawImage(
        this.image,
        this.box.left,
        this.box.top,
        this.box.width,
        this.box.height
        // -twidth / 2,
        // -theight / 2,
        // twidth,
        // theight
      );
      editCtx.restore();
      this.erasingData = erasingData;
      this.drawOverlaping();
    }
  }
  setBrushWidth(brushWidth) {
    let canvas = document.createElement("canvas");
    canvas.width = brushWidth;
    canvas.height = brushWidth;
    let ctx = canvas.getContext("2d");
    let img = new Image();
    img.src = cursor;
    const that = this;
    img.onload = function () {
      ctx.drawImage(img, 0, 0, brushWidth, brushWidth);
      let resizedImageData = canvas.toDataURL();
      that.bgCanvas.style.cursor = `url(${resizedImageData}) ${
        brushWidth / 2
      } ${brushWidth / 2}, auto`;
    };
    state().eraser.updateBrush(brushWidth);
  }
  setRestore(val) {
    state().eraser.changeType(val);
  }
  rotate(degrees) {
    console.log("rotate", this.box);
    this.erasingData.push(null);
    this.erasingData.push(degrees > 0 ? "rotateRight" : "rotateLeft");
    const width = this.editCanvas.width;
    const height = this.editCanvas.height;
    const editCanvas = this.editCanvas;
    editCanvas.width = height;
    editCanvas.height = width;
    console.log("rotate", editCanvas.width, editCanvas.height);
    this.bgCanvas.width = height;
    this.bgCanvas.height = width;
    this.undoDraw("redraw");
  }
  flip(val) {
    this.erasingData.push(null);
    this.erasingData.push(val);
    this.editCanvas.width = this.editCanvas.width;
    this.editCanvas.height = this.editCanvas.height;
    this.bgCanvas.width = this.editCanvas.width;
    this.bgCanvas.height = this.editCanvas.height;
    this.undoDraw("redraw");
  }
  undoErasing() {
    console.log("undasf");
    console.log(this.erasingData);
    if (
      this.erasingData.length > 0 &&
      this.erasingData[this.erasingData.length - 1].indexOf("width") > 0
    ) {
      console.log(this.lastBox);
      this.box = this.lastBox;
      tools().canvas.resize(this.lastBox.width, this.lastBox.height);
    }
    if (this.erasingData.length === 0) {
      this.lastBox = {
        left: 0,
        top: 0,
        width: this.dimension.width,
        height: this.dimension.height,
      };
      this.box = this.lastBox;
      // tools().canvas.resize(this.lastBox.width, this.lastBox.height);
    }
    fabricCanvas().renderAll();
    this.editCanvas.width = this.box.width;
    this.editCanvas.height = this.box.height;
    this.bgCanvas.width = this.box.width;
    this.bgCanvas.height = this.box.height;
    this.undoDraw("undo");
  }
  crop(box) {
    console.log(box);
    this.lastBox = this.box;
    this.box = {
      left: this.box.left + box.left,
      top: this.box.top + box.top,
      width: box.width,
      height: box.height,
    };
    this.erasingData.push(null);
    this.erasingData.push(JSON.stringify(box));
    const editCanvas = this.editCanvas;
    editCanvas.width = this.box.width;
    editCanvas.height = this.box.height;
    this.bgCanvas.width = this.box.width;
    this.bgCanvas.height = this.box.height;
    this.undoDraw("redraw");
  }
  canUndo() {
    return this.erasingData.length > 0;
  }
  canRedo() {
    return this.redoData.length > 0;
  }
  async apply() {}
  async reset() {
    await tools().canvas.addMainImage(state().eraser.image);
    this.erasingData = [];
    this.redoData = [];
    this.editCanvas.width = this.dimension.width;
    this.editCanvas.height = this.dimension.height;
    this.bgCanvas.width = this.dimension.width;
    this.bgCanvas.height = this.dimension.height;
  }
}
