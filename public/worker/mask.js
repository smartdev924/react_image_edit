importScripts("blur.js");
function morphology(input, width, height, size) {
  if (isNaN(size)) return input;
  size |= 0;
  if (size == 0) return input;
  var output = new ImageData(width, height);
  var data = input.data;
  var out = output.data;
  var ksize = Math.abs(size) + 2;
  var half = Math.floor(ksize / 2);
  for (var y = 0; y < height - 1; y++) {
    for (var x = 0; x < width - 1; x++) {
      var px = (y * width + x) * 4;
      var r = 0;
      if (size < 0) r = 255;
      for (var cy = -half; cy < half; ++cy) {
        for (var cx = -half; cx < half; ++cx) {
          var xx = x + cx;
          var yy = y + cy;
          if (xx < 0 || xx >= width || yy < 0 || yy >= height) continue;
          var cpx = (yy * width + xx) * 4;
          var val = data[cpx + 0];
          if (size > 0) r = Math.max(r, val);
          else if (size < 0) r = Math.min(r, val);
        }
      }
      out[px + 0] = r;
      out[px + 1] = r;
      out[px + 2] = r;
      out[px + 3] = data[px + 3];
    }
  }
  return output;
}
function calcContentRect(imagedata, width, height) {
  var max_val = 10000;
  var tl = { x: max_val, y: max_val };
  var br = { x: -max_val, y: -max_val };
  var empty = true;
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      var i = y * width * 4 + x * 4;
      if (
        imagedata.data[i + 0] > 5 ||
        imagedata.data[i + 1] > 5 ||
        imagedata.data[i + 2] > 5
      ) {
        tl.x = Math.min(tl.x, x);
        tl.y = Math.min(tl.y, y);
        br.x = Math.max(br.x, x);
        br.y = Math.max(br.y, y);
        empty = false;
      }
    }
  }
  var rect = { x: 0, y: 0, width: 0, height: 0 };
  if (empty) return rect;
  rect.x = tl.x;
  rect.y = tl.y;
  rect.width = br.x - tl.x;
  rect.height = br.y - tl.y;
  return rect;
}
function createTrimap(maskData, mattingData) {
  for (var i = 0; i < maskData.data.length; i += 4) {
    if (mattingData.data[i]) val = 128;
    else if (maskData.data[i + 1] > 128) val = 255;
    else val = 0;
    mattingData.data[i + 0] =
      mattingData.data[i + 1] =
      mattingData.data[i + 2] =
        val;
    mattingData.data[i + 3] = 255;
  }
}

onmessage = function (event) {
  console.log("mask worker");
  var imageData = event.data.imageData;
  var mattingData = event.data.mattingData;
  var width = event.data.width;
  var height = event.data.height;
  var radius = event.data.feathering;
  var offset = event.data.offset;
  imageData = morphology(imageData, width, height, offset);
  var trimapRect = null;
  if (mattingData) {
    trimapRect = calcContentRect(mattingData, width, height);
    createTrimap(imageData, mattingData);
  }
  blurImageData(imageData, 0, 0, width, height, radius);
  var contentRect = calcContentRect(imageData, width, height);
  postMessage({
    status: "complete",
    imageData: imageData,
    contentRect: contentRect,
    trimapData: mattingData,
    trimapRect: trimapRect,
  });
  close();
};
