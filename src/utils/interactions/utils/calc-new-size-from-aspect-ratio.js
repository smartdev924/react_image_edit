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
