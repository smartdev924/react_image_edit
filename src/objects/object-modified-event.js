import { fabricCanvas } from "../state/utils";
import { SIZE_AND_POSITION_PROPS } from "./size-and-position-props";

export function fireObjModifiedEvent(values = {}) {
  fabricCanvas().fire("object:modified", buildObjModifiedEvent(values));
}

export function buildObjModifiedEvent(values) {
  return {
    values,
    sizeOrPositionChanged: sizeOrPositionChanged(values),
  };
}

function sizeOrPositionChanged(values) {
  return Object.keys(values).some((r) => SIZE_AND_POSITION_PROPS.includes(r));
}
