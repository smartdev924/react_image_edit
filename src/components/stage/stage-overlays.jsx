import { ObjectBox } from "@/components/object-box/object-box";
import { ActiveToolOverlay } from "../../state/editor-state";
import { useStore } from "../../state/store";
import { Cropzone } from "../../tools/crop/ui/cropzone/cropzone";

export function StageOverlays() {
  const cropToolIsActive = useStore(
    (s) => s.activeToolOverlay === ActiveToolOverlay.Crop
  );
  // const objIsSelected = useStore((s) => s.objects.active.id);
  return (
    <div>
      {cropToolIsActive && <Cropzone />}
      {/* {objIsSelected && <ObjectBox />} */}
    </div>
  );
}
