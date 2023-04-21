import { ObjectName } from "@/objects/object-name";
import { ActiveToolOverlay } from "@/state/editor-state";
import { ToolName } from "@/tools/tool-name";
import { fabricCanvas, state, tools } from "../state/utils";

/**
 *
 * @param {import("@/tools/tool-name").ToolName} name
 * @returns
 */
export function setActiveTool(name = null) {
  // prevent changing of active tool if editor is dirty
  if (state().dirty) {
    return;
  }

  tools().zoom.fitToScreen();

  const [toolName, overlayName] = getToolForObj(
    fabricCanvas().getActiveObject()
  );
  if (name) {
    state().setActiveTool(name, toolName === name ? overlayName : null);
  } else {
    state().setActiveTool(toolName, overlayName);
  }
}

export function getToolForObj(obj) {
  switch (obj?.name) {
    case ObjectName.Text:
      return [ToolName.TEXT, ActiveToolOverlay.Text];
    case ObjectName.Image:
      return [ToolName.IMAGE, ActiveToolOverlay.Image];
    case ObjectName.Background:
      return [ToolName.BACKGROUND, ActiveToolOverlay.Background];
    case ObjectName.Crop:
      return [ToolName.IMAGE, ActiveToolOverlay.Crop];
    case ObjectName.Resize:
      return [ToolName.IMAGE, ActiveToolOverlay.Resize];
    case ObjectName.MainImage:
      return [ToolName.IMAGE, ActiveToolOverlay.Image];
    case ObjectName.Eraser:
      return [ToolName.ERASER, ActiveToolOverlay.Image];
    default:
      return [null, null];
  }
}

export function bindToFabricSelectionEvents() {
  state().fabric.on("selection:created", (e) => {
    console.log("selection:created");
    if (!shouldPreventObjDeselect(e)) {
      selectNewObj(e.target);
    }
  });
  state().fabric.on("selection:updated", (e) => {
    if (!shouldPreventObjDeselect(e)) {
      selectNewObj(e.target);
    }
  });
  state().fabric.on("selection:cleared", async () => {
    state().toggleLoading("applying");
    selectNewObj();
    await state().applyChanges();
    state().setDirty(false);
    state().setActiveTool(null, null);
    setTimeout(() => {
      state().toggleLoading(false);
    }, 50);
  });
}

function shouldPreventObjDeselect(e) {
  const [toolName] = getToolForObj(e.target);
  const objIsHandledByActiveTool = toolName === state().activeTool;
  if (state().dirty && (!e.target || !objIsHandledByActiveTool)) {
    if (e.deselected) {
      tools().objects.select(e.deselected[0]);
    }
    return true;
  }
  return false;
}

async function selectNewObj(obj) {
  if (obj?.data.id && obj?.data.id === state().objects.active.id) {
    return;
  }
  state().objects.setActive(obj ?? fabricCanvas().getActiveObject());
  setActiveTool(state().objects.active.name);
}
