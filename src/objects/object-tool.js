import { randomString } from "@/utils/util_functions";
import { useStore } from "../state/store";
import { fabricCanvas, state, tools } from "../state/utils";
import { bindToFabricSelectionEvents } from "./bind-to-fabric-selection-events";
import { fireObjModifiedEvent } from "./object-modified-event";
import { ObjectName } from "./object-name";
import { isSvgSticker } from "./utils/is-svg-sticker";
import { isText } from "./utils/is-text";

export class ObjectTool {
  constructor() {
    this.syncObjects();

    bindToFabricSelectionEvents();

    state().fabric.on("text:editing:entered", () => {
      state().objects.setIsEditingText(true);
    });
    state().fabric.on("text:editing:exited", () => {
      state().objects.setIsEditingText(false);
    });

    state().fabric.on("object:added", (e) => {
      // e.currentTarget.fill = state().objects.active.editableProps.fill;
      this.syncObjects();
    });
    state().fabric.on("object:removed", () => {
      this.syncObjects();
    });
  }

  /**
   * Get all objects that are currently on canvas.
   */
  getAll() {
    return fabricCanvas()
      .getObjects()
      .filter((obj) => !obj?.data?.internal);
  }

  /**
   * Get object with specified name from canvas.
   */
  get(name) {
    return this.getAll().find((obj) => obj.name === name);
  }

  /**
   * Get object with specified id from canvas.
   */
  getById(id) {
    return this.getAll().find((obj) => obj.data.id === id);
  }

  /**
   * Check whether specified object is currently selected.
   */
  isActive(objectOrId) {
    const objId =
      typeof objectOrId === "string" ? objectOrId : objectOrId.data.id;
    return state().objects.active?.id === objId;
  }

  /**
   * Get currently active object.
   */
  getActive() {
    return fabricCanvas().getActiveObject();
  }

  /**
   * Check if object with specified name exists on canvas.
   */
  has(name) {
    return this.getAll().findIndex((obj) => obj.name === name) > -1;
  }

  /**
   * Select specified object.
   */
  select(objOrId) {
    const obj = typeof objOrId === "string" ? this.getById(objOrId) : objOrId;
    if (!obj) return;
    fabricCanvas().setActiveObject(obj);
    fabricCanvas().requestRenderAll();
  }

  /**
   * Deselect currently active object.
   */
  deselectActive() {
    fabricCanvas().discardActiveObject();
    fabricCanvas().requestRenderAll();
  }

  /**
   * Apply values to specified or currently active object.
   */
  setValues(values, obj) {
    obj = obj || this.getActive();
    if (!obj) return;

    let fontChanged = false;

    if (isText(obj)) {
      if (
        values.fontFamily !== obj.fontFamily ||
        values.fontSize !== obj.fontSize
      ) {
        fontChanged = true;
      }
      if (obj.selectionStart !== obj.selectionEnd) {
        obj.setSelectionStyles(values);
      } else {
        obj.set(values);
      }
    } else {
      obj.set(values);
    }

    // sometimes changes are not rendered until next render without this
    if (fontChanged) {
      setTimeout(() => {
        fabricCanvas().requestRenderAll();
      }, 50);
    } else {
      fabricCanvas().requestRenderAll();
    }
    state().objects.setActive(obj);
    fireObjModifiedEvent(values);
  }

  /**
   * Move specified or currently active object in given direction.
   */
  move(direction, amount, obj) {
    obj = obj || this.getActive();
    if (!obj) return;
    if (direction === "up") {
      this.setValues({ top: obj.top - amount });
    } else if (direction === "down") {
      this.setValues({ top: obj.top + amount });
    } else if (direction === "left") {
      this.setValues({ left: obj.left - amount });
    } else if (direction === "right") {
      this.setValues({ left: obj.left + amount });
    }
    tools().canvas.render();
  }

  /**
   * Bring specified or currently active object to front of canvas.
   */
  bringToFront(obj) {
    obj = obj || this.getActive();
    if (!obj) return;
    obj.bringToFront();
    tools().canvas.render();
  }

  /**
   * Send specified or currently active object to the back of canvas.
   */
  sendToBack(obj) {
    obj = obj || this.getActive();
    if (!obj) return;
    obj.sendToBack();
    tools().canvas.render();
  }

  /**
   * Flip specified or currently active object horizontally.
   */
  flipHorizontally(obj) {
    obj = obj || this.getActive();
    if (!obj) return;
    this.setValues({ flipX: !obj.flipX });
    tools().canvas.render();
  }

  /**
   * Duplicate specified or currently active object.
   */
  duplicate(obj) {
    const original = obj || this.getActive();
    if (!original) return;

    this.deselectActive();

    original.clone((clonedObj) => {
      clonedObj.set({
        left: original.left + 40,
        top: original.top + 40,
        data: { ...original.data, id: randomString(10) },
        name: original.name,
      });

      fabricCanvas().add(clonedObj);
      this.select(clonedObj);
      tools().canvas.render();
    });
  }

  /**
   * Delete specified or currently active object.
   */
  delete(obj) {
    obj = obj || this.getActive();
    if (!obj) return;
    this.deselectActive();
    fabricCanvas().remove(obj);
    fabricCanvas().requestRenderAll();
    if (obj.name === ObjectName.MainImage && state().replaced) return;
    tools().history.addHistoryItem({ name: "deletedObject" });
  }

  /**
   * Sync layers list with fabric.js objects.
   * @hidden
   */
  syncObjects() {
    const partial = this.getAll().map((o) => ({
      name: o.name,
      selectable: o.selectable ?? false,
      id: o.data.id,
    }));
    useStore.setState({
      objects: {
        ...state().objects,
        all: partial,
      },
    });
  }
}
