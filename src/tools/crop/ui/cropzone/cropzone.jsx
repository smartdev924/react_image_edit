import { useEffect, useLayoutEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useStore } from "@/state/store";
import { MaskPart, MaskPosition } from "./mask-part";
import { Line } from "./cropzone-line";
import { Interactable } from "@/utils/interactions/interactable";
import { aspectRatioFromStr } from "@/utils/interactions/utils/calc-new-size-from-aspect-ratio";
import { ResizeAction } from "@/utils/interactions/actions/resize-action";
import { MoveAction } from "@/utils/interactions/actions/move-action";
import { constrainWithinBoundary } from "@/utils/interactions/modifiers/constrain-within-boundary";
import { tools } from "@/state/utils";

export function CornerHandle({ position, inset = false }) {
  const className = getPositionClass(position, inset);
  return (
    <div
      data-position={position}
      className={`border-white before:inset-0 before:block before:absolute before:border-black before:z-20 -z-10 absolute w-20 h-20 ${className}`}
    />
  );
}

function getPositionClass(position, inset) {
  const left = inset ? "left-0" : "-left-5";
  const top = inset ? "top-0" : "-top-5";
  const bottom = inset ? "bottom-0" : "-bottom-5";
  const right = inset ? "right-0" : "-right-5";
  switch (position) {
    case "top-left":
      return `${left} ${top} border-l-4 before:border-l-2 border-t-4 before:border-t-2 cursor-nwse-resize`;
    case "top-right":
      return `${right} ${top} border-r-4 before:border-r-2 border-t-4 before:border-t-2 cursor-nesw-resize`;
    case "bottom-right":
      return `${right} ${bottom} border-r-4 before:border-r-2 border-b-4 before:border-b-2 cursor-se-resize`;
    case "bottom-left":
      return `${left} ${bottom} border-l-4 before:border-l-2 border-b-4 before:border-b-2 cursor-sw-resize`;
    default:
      return "";
  }
}

export function Cropzone() {
  const refs = useRef({});
  const [isMoving, setIsMoving] = useState(true);
  const boundaryRect = useStore((s) => s.canvasSize);
  const controlConfig = useStore((s) => s.config.tools?.crop?.cropzone);
  const defaultRatio =
    useStore((s) => s.config.tools?.crop?.defaultRatio) || null;

  useEffect(() => {
    if (tools().crop) {
      // @ts-ignore
      tools().crop.zone = new Interactable(refs.current.innerZone, {
        actions: [new MoveAction(), new ResizeAction()],
        modifiers: [constrainWithinBoundary],
        listeners: {
          onPointerDown: () => {
            setIsMoving(true);
          },
          onMove: (e) => {
            tools().crop.drawZone(e.rect);
          },
          onResize: (e) => {
            tools().crop.drawZone(e.rect);
          },
          onPointerUp: () => {
            setIsMoving(false);
          },
        },
        minHeight: 50,
        minWidth: 50,
        boundaryRect,
        aspectRatio: aspectRatioFromStr(null),
        maintainAspectRatio: false,
      });
    }
    return () => {
      tools().crop.zone?.destroy();
    };
    // boundary and aspect ratio will be updated by below hook when resetting cropzone
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // redraw cropzone if default aspect ratio or canvas size change
  useLayoutEffect(() => {
    tools().crop.registerRefs(refs);
    tools().crop.resetCropzone(defaultRatio);
  }, [defaultRatio, boundaryRect]);

  const className = clsx(
    "cropzone absolute z-50 isolate left-0 top-0 w-full h-full overflow-hidden",
    {
      moving: isMoving,
    }
  );

  return (
    <div
      className={className}
      onPointerDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <div
        className="cropzone-transition border-white/50 absolute z-10 left-0 top-0 border"
        style={{
          boxShadow: "0 0 0 1px black inset, 0 0 0 2px white inset",
        }}
        ref={(el) => {
          // @ts-ignore
          refs.current.innerZone = el;
        }}
      >
        {!controlConfig?.hideTopLeft && (
          <CornerHandle position="top-left" inset />
        )}
        {!controlConfig?.hideTopRight && (
          <CornerHandle position="top-right" inset />
        )}
        {!controlConfig?.hideBottomLeft && (
          <CornerHandle position="bottom-left" inset />
        )}
        {!controlConfig?.hideBottomRight && (
          <CornerHandle position="bottom-right" inset />
        )}

        <Line name="lineVer1" refs={refs} />
        <Line name="lineVer2" refs={refs} />
        <Line name="lineHor1" refs={refs} />
        <Line name="lineHor2" refs={refs} />
      </div>

      <MaskPart refs={refs} position={MaskPosition.top} />
      <MaskPart refs={refs} position={MaskPosition.left} />
      <MaskPart refs={refs} position={MaskPosition.right} />
      <MaskPart refs={refs} position={MaskPosition.bottom} />
    </div>
  );
}
