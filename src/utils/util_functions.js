/**
 * @param {number} length
 * @returns {string}
 */
export function randomString(length = 36) {
  let random = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i += 1) {
    random += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return random;
}

/**
 * @type {import('fabric/fabric-impl').IObjectOptions}
 */
export const DEFAULT_OBJ_CONFIG = {
  lockScalingFlip: true,
  originY: "center",
  originX: "center",
  borderColor: "transparent",
  hasBorders: true,
};
