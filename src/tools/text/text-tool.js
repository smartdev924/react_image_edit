import { fabric } from "fabric";
import { defaultObjectProps } from "../../config/default-object-props";
import { ObjectName } from "../../objects/object-name";
import { fabricCanvas, state, tools } from "../../state/utils";

export const TEXT_CONTROLS_PADDING = 15;

export class TextTool {
  minWidth = 250;

  /**
   * Add specified text to canvas.
   */
  add(text, providedConfig = {}) {
    text = text || state().config.tools?.text?.defaultText;
    if (!text) return;
    const options = {
      ...state().config.objectDefaults?.text,
      ...providedConfig,
      name: ObjectName.Text,
      padding: TEXT_CONTROLS_PADDING,
      editingBorderColor: defaultObjectProps.fill,
    };

    const itext = new fabric.IText(text, {
      ...options,
      moveCursor: "pointer",
      hasControls: true,
    });
    fabricCanvas().add(itext);
    this.autoPositionText(itext);

    tools().objects.select(itext);
  }

  autoPositionText(text) {
    const canvasWidth = fabricCanvas().getWidth();
    const canvasHeight = fabricCanvas().getHeight();

    // make sure min width is not larger than canvas width
    const minWidth = Math.min(fabricCanvas().getWidth(), this.minWidth);

    text.scaleToWidth(Math.max(canvasWidth / 3, minWidth));

    // make sure text is not scaled outside canvas
    if (text.getScaledHeight() > canvasHeight) {
      text.scaleToHeight(canvasHeight - text.getScaledHeight() - 20);
    }

    text.viewportCenter();

    // push text down, if it intersects with another text object
    // fabricCanvas()
    //   .getObjects("i-text")
    //   .forEach((obj) => {
    //     if (obj === text) return;
    //     if (obj.intersectsWithObject(text)) {
    //       const offset = obj.top - text.top + obj.getScaledHeight();
    //       let newTop = text.top + offset;

    //       // if pushing object down would push it outside canvas, position text at top of canvas
    //       if (newTop > state().original.height - obj.getScaledHeight()) {
    //         newTop = 0;
    //       }

    //       text.set("top", newTop);
    //       text.setCoords();
    //     }
    //   });
  }
}
