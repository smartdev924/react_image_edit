export function pointerIsOutsideBoundary(e, boundary) {
  if (!boundary) return false;

  // top
  if (boundary.top >= e.pageY) {
    return true;
  }

  // right
  if (boundary.right <= e.pageX) {
    return true;
  }

  // bottom
  if (boundary.bottom <= e.pageY) {
    return true;
  }

  // left
  if (boundary.left >= e.pageX) {
    return true;
  }

  return false;
}
