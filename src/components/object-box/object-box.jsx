import { useStore } from "@/state/store";
import { fabricCanvas, state, tools } from "@/state/utils";
import { CornerHandle } from "@/tools/crop/ui/cropzone/cropzone";
import { MoveAction } from "@/utils/interactions/actions/move-action";
import { ResizeAction } from "@/utils/interactions/actions/resize-action";
import { Interactable } from "@/utils/interactions/interactable";
import { useEffect, useRef } from "react";
import {
  enableTextEditing,
  moveActiveObj,
  resizeActiveObj,
  rotateActiveObj,
  syncBoxPositionWithActiveObj,
} from "./object-box-actions";

export function ObjectBox() {
  const boxRef = useRef(null);
  const interactableRef = useRef(null);
  const floatingControlsRef = useRef(null);
  const objectControlConfig = useStore((s) => s.config.objectControls);
  const activeObjId = useStore((s) => s.objects.active.id);
  const isEditingText = useStore((s) => s.objects.isEditingText);
  const zoom = useStore((s) => s.zoom);
  const objTypeConfig = getObjTypeConfig();
  console.log("objectControlConfig", objectControlConfig);
  useEffect(() => {
    // wait until fabric is initialized
    if (!fabricCanvas()) return;
    state().fabric.on("object:modified", (e) => {
      if (e.sizeOrPositionChanged) {
        syncBoxPositionWithActiveObj(boxRef, floatingControlsRef);
      }
    });
    interactableRef.current = new Interactable(boxRef.current, {
      minWidth: 50,
      minHeight: 50,
      maintainInitialAspectRatio: true,
      actions: [new MoveAction(), new ResizeAction()],
      listeners: {
        onPointerUp: () => {
          state().objects.setActiveIsMoving(false);
        },
        onDoubleTap: () => {
          enableTextEditing();
        },
        onRotate: (e) => {
          state().objects.setActiveIsMoving(true);
          rotateActiveObj(e);
        },
        onMove: (e) => {
          state().objects.setActiveIsMoving(true);
          moveActiveObj(e);
        },
        onResize: (e) => {
          state().objects.setActiveIsMoving(true);
          resizeActiveObj(e);
        },
      },
    });
    return () => {
      interactableRef.current.destroy();
    };
  }, []);

  useEffect(() => {
    onObjectControlConfigChange(interactableRef.current, objTypeConfig);
  }, [objectControlConfig]);

  // reposition on when obj is selected/deselected, or zoom or after user is done with editing text
  useEffect(() => {
    syncBoxPositionWithActiveObj(boxRef, floatingControlsRef);
  }, [activeObjId, zoom, isEditingText]);

  const display = activeObjId && !isEditingText ? "block" : "hidden";

  return (
    <div className={display}>
      <div
        ref={boxRef}
        className="absolute z-obj-box border-2 border-white shadow-md cursor-move"
      >
        {!objTypeConfig.hideTopLeft && <CornerHandle position="top-left" />}
        {!objTypeConfig.hideTopRight && <CornerHandle position="top-right" />}
        {!objTypeConfig.hideBottomLeft && (
          <CornerHandle position="bottom-left" />
        )}
        {!objTypeConfig.hideBottomRight && (
          <CornerHandle position="bottom-right" />
        )}
      </div>
    </div>
  );
}

function onObjectControlConfigChange(interactable, objTypeConfig = {}) {
  // maybe lock movement based on user config
  const moveAction = interactable?.config.actions.find(
    (a) => a instanceof MoveAction
  );
  moveAction.lockMovement = !!objTypeConfig.lockMovement;

  // maybe maintain aspect ratio
  interactable.setConfig({
    maintainInitialAspectRatio: !objTypeConfig.unlockAspectRatio,
  });
}

function getObjTypeConfig() {
  const obj = tools().objects?.getActive();
  if (!obj || !obj.name) return {};
  const userConfig = state().config.objectControls || {};
  const objName = obj.name;
  return {
    ...userConfig.global,
    ...userConfig[objName],
  };
}
