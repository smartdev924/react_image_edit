import { HISTORY_DISPLAY_NAMES } from "../tools/history/history-display-names";

export const ObjectName = {
  Eraser: "eraser",
  Text: "text",
  Image: "image",
  Background: "background",
  StraightenAnchor: "straightenHelper",
  Shadow: "shadow",
  Effects: "effects",
  Crop: "crop",
  Resize: "resize",
  MainImage: "mainImage",
};

export const OBJ_DISPLAY_NAMES = {
  [ObjectName.Text]: {
    name: "Text",
    icon: HISTORY_DISPLAY_NAMES.text.icon,
  },
  [ObjectName.Background]: {
    name: "Shape",
    icon: HISTORY_DISPLAY_NAMES.background.icon,
  },
  [ObjectName.Image]: {
    name: "Image",
    icon: HISTORY_DISPLAY_NAMES.image.icon,
  },
  [ObjectName.Background]: {
    name: "Background Image",
    icon: HISTORY_DISPLAY_NAMES.bgImage.icon,
  },
  [ObjectName.Shadow]: {
    name: "Change Image",
    icon: HISTORY_DISPLAY_NAMES.shadow.icon,
  },
  [ObjectName.Crop]: {
    name: "Crop Image",
    icon: HISTORY_DISPLAY_NAMES.crop.icon,
  },
  [ObjectName.Resize]: {
    name: "Resize Image",
    icon: HISTORY_DISPLAY_NAMES.resize.icon,
  },
  [ObjectName.Effects]: {
    name: "Resize Image",
    icon: HISTORY_DISPLAY_NAMES.effects.icon,
  },
  [ObjectName.MainImage]: {
    name: "Main Image",
    icon: HISTORY_DISPLAY_NAMES.mainImage.icon,
  },
};
