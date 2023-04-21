import { HISTORY_DISPLAY_NAMES } from "../tools/history/history-display-names";
import { ToolName } from "../tools/tool-name";

export const DEFAULT_NAV_ITEMS = Object.values(ToolName).map((toolName) => {
  // console.log(HISTORY_DISPLAY_NAMES[toolName]);
  return {
    name: toolName.split("_").join(" "),
    icon: HISTORY_DISPLAY_NAMES[toolName].icon,
    action: toolName,
  };
});

export const navItemMessages = {
  eraser: { defaultMessage: "Eraser", description: "Navbar item" },
  image: { defaultMessage: "Image", description: "Navbar item" },
  text: { defaultMessage: "Text", description: "Navbar item" },
  background: { defaultMessage: "Background", description: "Navbar item" },
  shadow: { defaultMessage: "Shadow", description: "Navbar item" },
  filter: { defaultMessage: "Effects", description: "Navbar item" },
};
