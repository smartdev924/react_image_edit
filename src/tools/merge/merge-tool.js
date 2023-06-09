import { ObjectName } from "../../objects/object-name";
import { state, tools } from "../../state/utils";

export class MergeTool {
  canMerge() {
    return (
      tools()
        .objects.getAll()
        .filter((obj) => obj.name !== ObjectName.MainImage).length > 0
    );
  }

  async apply() {
    state().toggleLoading("merge");
    const data = tools().export.getDataUrl();
    if (data) {
      await tools().canvas.addMainImage(data, "merge");
    }
  }
}
