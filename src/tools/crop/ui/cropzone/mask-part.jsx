export const MaskPosition = {
  top: "maskTop",
  right: "maskRight",
  bottom: "maskBottom",
  left: "maskLeft",
};

export function MaskPart({ position, refs }) {
  const className = getClassNameByPosition(position);
  return (
    <div
      className={`cropzone-transition bg-black/50 bottom absolute ${className}`}
      ref={(el) => (refs.current[position] = el)}
    />
  );
}

function getClassNameByPosition(position) {
  switch (position) {
    case MaskPosition.top:
      return "left-0 top-0";
    case MaskPosition.bottom:
      return "bottom-0 left-0";
    default:
      return "";
  }
}
