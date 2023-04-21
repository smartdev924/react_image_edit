import { ObjectName } from "../object-name";

export function isSvgSticker(obj) {
  return obj.name === ObjectName.Sticker && "forEachObject" in obj;
}
