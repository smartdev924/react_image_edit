import { fabric } from "fabric";
import { state, tools } from "@/state/utils";
import { isText } from "@/objects/utils/is-text";

const floatingControlsSize = {
  width: 120,
  height: 30,
};

export function repositionFloatingControls(obj, el) {
  if (!el) return;
  const angle = obj.angle || 0;
  // make sure rotation handle is not covered when it's at the top
  const floatingControlsTopOffset = angle > 168 && angle < 188 ? -30 : -15;
  const canvas = state().canvasSize;
  const stage = state().stageSize;
  const size = floatingControlsSize;

  // margin between canvas el and wrapper el edges
  const canvasTopMargin = canvas.top - stage.top;
  const canvasLeftMargin = canvas.left - stage.left;
  const canvasRightMargin = stage.width - (canvasLeftMargin + canvas.width);
  const canvasBottomMargin = stage.height - (canvasTopMargin + canvas.height);

  // floating controls' max boundaries
  const maxTop = -canvasTopMargin;
  const maxLeft = -(canvas.left - stage.left);
  const maxRight = canvas.width - size.width + canvasRightMargin;
  const maxBottom = canvas.height - size.height + canvasBottomMargin;

  // position floating controls
  const boundingRect = obj.getBoundingRect();
  let floatingTop = boundingRect.top - size.height + floatingControlsTopOffset;
  let floatingLeft =
    boundingRect.left + boundingRect.width / 2 - size.width / 2;

  floatingTop = Math.min(maxBottom, Math.max(maxTop, floatingTop));
  floatingLeft = Math.min(maxRight, Math.max(maxLeft, floatingLeft));

  el.style.transform = `translate(${floatingLeft}px, ${floatingTop}px) rotate(0deg)`;
}
export function rotateActiveObj(e) {
  const obj = tools().objects.getActive();
  if (!obj) return;
  const newAngle = fabric.util.radiansToDegrees(e.rect.angle);
  if (newAngle !== obj.angle) {
    tools().objects.setValues({ angle: newAngle });
  }
}

export function moveActiveObj(e) {
  const centerX = e.rect.width / 2;
  const centerY = e.rect.height / 2;
  tools().objects.setValues({
    left: (e.rect.left + centerX) / state().zoom,
    top: (e.rect.top + centerY) / state().zoom,
  });
}

export function resizeActiveObj(e) {
  const obj = tools().objects.getActive();
  if (!obj) return;

  const newValues = {};

  if (isText(obj)) {
    const delta = e.rect.width - (e.prevRect?.width ?? 0);
    if (
      delta > 0 ||
      (obj.getScaledHeight() >= 20 && obj.getScaledWidth() >= 20)
    ) {
      newValues.fontSize = (obj.fontSize || 1) + delta;
    }
  } else {
    if (obj.width) {
      newValues.scaleX = e.rect.width / state().zoom / obj.width;
    }
    if (obj.height) {
      newValues.scaleY = e.rect.height / state().zoom / obj.height;
    }
  }
  tools().objects.setValues(newValues);
}

export function syncBoxPositionWithActiveObj(boxRef, floatingControlsRef) {
  const obj = tools().objects.getActive();
  if (!obj || !boxRef.current) return;
  const el = boxRef.current;

  // bounding box position
  const angleRad = fabric.util.degreesToRadians(obj.angle ?? 0);
  let width = Math.round(obj.getScaledWidth() * state().zoom);
  let height = Math.round(obj.getScaledHeight() * state().zoom);
  let left = Math.round((obj.left ?? 0) * state().zoom);
  let top = Math.round((obj.top ?? 0) * state().zoom);

  const centerX = obj.originX === "center" ? width / 2 : 0;
  const centerY = obj.originY === "center" ? height / 2 : 0;

  if (obj.padding) {
    width += obj.padding * 2;
    height += obj.padding * 2;
    left -= obj.padding;
    top -= obj.padding;
  }

  // position bounding box
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
  el.style.transform = `translate(${left - centerX}px, ${
    top - centerY
  }px) rotate(${angleRad}rad)`;

  tools().canvas.render();

  repositionFloatingControls(obj, floatingControlsRef.current);
}

export function enableTextEditing() {
  const obj = tools().objects.getActive();
  if (isText(obj)) {
    obj.enterEditing();
    obj.hiddenTextarea?.focus();
  }
}
