export const ToolName =
  /** @type {const} */
  ({
    ERASER: "eraser",
    IMAGE: "image",
    TEXT: "text",
    BACKGROUND: "background",
    SHADOW: "shadow",
    EFFECTS: "effects",
  });

/**
 * @typedef {typeof ToolName[keyof typeof ToolName]} ToolName
 * @exports ToolName
 */
