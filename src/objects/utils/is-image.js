import { ObjectName } from "../object-name";

export function isImage(obj) {
  return obj.name === ObjectName.Image || obj.name === ObjectName.Background;
}
