import { calcNewSizeFromAspectRatio } from "../utils/calc-new-size-from-aspect-ratio";

export function constrainWithinBoundary(
  { currentRect, prevRect },
  { boundaryRect, minWidth, minHeight, aspectRatio }
) {
  let cr = { ...currentRect };
  const pr = { ...prevRect };

  if (boundaryRect) {
    // hit left boundary
    if (cr.left < 0) {
      cr = pr;
    }
    // hit top boundary
    if (cr.top < 0) {
      cr = pr;
    }
    // hit right boundary
    if (cr.left + cr.width > boundaryRect.width) {
      cr = pr;
    }
    // hit bottom boundary
    if (cr.top + cr.height > boundaryRect.height) {
      cr = pr;
    }
  }

  if (minWidth || minHeight) {
    let min;
    if (aspectRatio) {
      min = calcNewSizeFromAspectRatio(aspectRatio, minWidth, minHeight);
    } else {
      min = { width: minWidth, height: minHeight };
    }

    // min width
    if (min.width && cr.width < min.width) {
      cr.left = pr.left;
      cr.width = min.width;
    }

    // min height
    if (min.height && cr.height < min.height) {
      cr.top = pr.top;
      cr.height = min.height;
    }
  }

  return cr;
}
