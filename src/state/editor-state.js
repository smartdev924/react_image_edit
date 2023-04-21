export const ActiveToolOverlay =
  /** @type {const} */
  ({
    Filter: "filter",
    ActiveObject: "activeObj",
    Text: "text",
    ChangeImage: "changeImage",
    Crop: "crop",
    Resize: "resize",
    Image: "image",
    Background: "background",
    Shadow: "shadow",
    Effects: "effects",
  });

/**
 * @typedef {typeof ActiveToolOverlay[keyof typeof ActiveToolOverlay]} ActiveToolOverlay
 * @exports ActiveToolOverlay
 */
