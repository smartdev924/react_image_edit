import { getBgCanvas } from "@/state/utils";

export function cpuBlur(canvas, image, blur) {
  const ctx = canvas.getContext("2d");
  let sum = 0;
  const delta = 5;
  const alphaLeft = 1 / (2 * Math.PI * delta * delta);
  const step = blur < 3 ? 1 : 2;
  for (let y = -blur; y <= blur; y += step) {
    for (let x = -blur; x <= blur; x += step) {
      const weight =
        alphaLeft * Math.exp(-(x * x + y * y) / (2 * delta * delta));
      sum += weight;
    }
  }
  for (let y = -blur; y <= blur; y += step) {
    for (let x = -blur; x <= blur; x += step) {
      ctx.globalAlpha =
        ((alphaLeft * Math.exp(-(x * x + y * y) / (2 * delta * delta))) / sum) *
        blur;
      ctx.drawImage(image, x, y);
    }
  }
  ctx.globalAlpha = 1;
}

function renderImageToCanvas(image, canvas) {
  const { width, height } = image;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(image, 0, 0, width, height);
}
function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}
function drawAndBlurImageOnCanvas(image, blurAmount, canvas) {
  const { height, width } = image;
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  if (isSafari()) {
    cpuBlur(canvas, image, blurAmount);
  } else {
    // tslint:disable:no-any
    ctx.filter = `blur(${blurAmount}px)`;
    ctx.drawImage(image, 0, 0, width, height);
  }
  ctx.restore();
}

export function drawAndBlurImageOnOffScreenCanvas(canvas, image, blurAmount) {
  if (blurAmount === 0) {
    renderImageToCanvas(image, canvas);
  } else {
    drawAndBlurImageOnCanvas(image, blurAmount, canvas);
  }
  return canvas;
}
/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
export function fixMask(ctx, x, y, width, height) {
  var imgData = ctx.getImageData(x, y, width, height);
  for (var i = 0; i < imgData.data.length; i += 4) {
    if (
      imgData.data[i] != 0 ||
      imgData.data[i + 1] != 0 ||
      imgData.data[i + 2] != 0
    ) {
      imgData.data[i + 3] = imgData.data[i + 1];
      imgData.data[i] = 0;
      imgData.data[i + 1] = 255;
      imgData.data[i + 2] = 0;
    } else {
      imgData.data[i] = 0;
      imgData.data[i + 1] = 0;
      imgData.data[i + 2] = 0;
      imgData.data[i + 3] = 0;
    }
  }
  ctx.putImageData(imgData, x, y);
}
