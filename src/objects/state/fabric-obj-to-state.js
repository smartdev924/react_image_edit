import { isText } from "../utils/is-text";

export function fabricObjToState(obj) {
  if (!obj) return {};

  const props = {
    fill: obj.fill,
    opacity: obj.opacity,
    backgroundColor: obj.backgroundColor,
    stroke: obj.stroke,
    strokeWidth: obj.strokeWidth,
  };

  const shadow = obj.shadow;
  if (shadow) {
    props.shadow = {
      color: shadow.color,
      blur: shadow.blur,
      offsetX: shadow.offsetX,
      offsetY: shadow.offsetY,
    };
  }

  if (isText(obj)) {
    props.textAlign = obj.textAlign;
    props.underline = obj.underline;
    props.linethrough = obj.linethrough;
    props.fontStyle = obj.fontStyle;
    props.fontFamily = obj.fontFamily;
    props.fontWeight = obj.fontWeight;
    props.fontSize = obj.fontSize;
  }

  return props;
}
