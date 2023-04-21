import { useStore } from "@/state/store";
import { fabricCanvas, tools } from "@/state/utils";
import { ToolName } from "@/tools/tool-name";
import { Box, Grid } from "@mui/material";
import { createUseGesture, dragAction, pinchAction } from "@use-gesture/react";
import { fabric } from "fabric";
import React, { useEffect } from "react";
import { StageOverlays } from "./stage-overlays";
const useGesture = createUseGesture([dragAction, pinchAction]);
const startErasing = (e) => {
  tools().brush.startErasing(e);
};
const stopErasing = (e) => {
  tools().brush.stopErasing();
};
const erase = (e) => {
  tools().brush.erase(e);
};
export const CanvasWrapper = React.forwardRef((props, canvasRef) => {
  const editCanvasRef = props.editCanvasRef;
  const bgCanvasRef = props.bgCanvasRef;
  const activeTool = useStore((s) => s.activeTool);
  return (
    <>
      <div className="relative m-auto w-full flex justify-center align-center">
        <Grid
          container
          spacing={2}
          style={{
            justifyContent: "center",
          }}
          width={"100%"}
        >
          <Grid
            display={activeTool === ToolName.ERASER ? "block" : "none"}
            item
            xs={6}
          >
            <ExtraCanvas
              bgCanvasRef={bgCanvasRef}
              editCanvasRef={editCanvasRef}
            />
          </Grid>
          <Grid item xs={6}>
            <div
              style={{
                backgroundImage: `url('/assets/images/empty-canvas-bg.png')`,
              }}
              className="aspect-square max-w-full flex justify-center items-center relative"
              ref={props.mainRef}
            >
              <PanContainer ref={props.panContainerRef}>
                <StageOverlays />
                <canvas
                  ref={canvasRef}
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0)",
                  }}
                />
              </PanContainer>
            </div>
          </Grid>
        </Grid>
      </div>
    </>
  );
});

const PanContainer = React.forwardRef(
  // @ts-ignore
  ({ children }, ref) => {
    const bind = useGesture({
      onPinch: (e) => {
        if (!tools().zoom.allowUserZoom || !shouldHandleGesture(e)) {
          return e.cancel();
        }
        if (e.direction[0] === 1) {
          tools().zoom.zoomIn(0.01);
        } else {
          tools().zoom.zoomOut(0.01);
        }
        e.event.stopPropagation();
        e.event.preventDefault();
      },
      onDrag: (e) => {
        console.log(e);
        if (e.pinching || !shouldHandleGesture(e)) {
          return e.cancel();
        }
        fabricCanvas().relativePan(new fabric.Point(e.delta[0], e.delta[1]));
        fabricCanvas().renderAll();
      },
    });

    return (
      <div
        ref={ref}
        className="flex items-center justify-center flex-col w-full h-full overflow-hidden touch-none"
        // @ts-ignore
        {...bind()}
      >
        {children}
      </div>
    );
  }
);

function shouldHandleGesture(e) {
  return !(
    fabricCanvas().findTarget(e.event, false) || fabricCanvas().isDrawingMode
  );
}

const ExtraCanvas = ({ bgCanvasRef, editCanvasRef }) => {
  useEffect(() => {
    bgCanvasRef.current.addEventListener("touchmove", (e) => {
      e.preventDefault();
      erase(e.touches[0]);
    });
    bgCanvasRef.current.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        startErasing(e.touches[0]);
      },
      { passive: false }
    );
    bgCanvasRef.current.addEventListener("touchend", (e) => {
      e.preventDefault();
      stopErasing(e.touches[0]);
    });
    return () => {
      bgCanvasRef.current.removeEventListener("touchmove", (e) => {
        e.preventDefault();
        erase(e.touches[0]);
      });
      bgCanvasRef.current.removeEventListener(
        "touchstart",
        (e) => {
          e.preventDefault();
          startErasing(e.touches[0]);
        },
        { passive: false }
      );
      bgCanvasRef.current.removeEventListener("touchend", (e) => {
        e.preventDefault();
        stopErasing(e.touches[0]);
      });
    };
  }, [bgCanvasRef.current]);
  return (
    <Box
      sx={{
        backgroundImage: `url('/assets/images/empty-canvas-bg.png')`,
      }}
      className="aspect-square flex justify-center items-center relative overflow-hidden"
    >
      <canvas ref={editCanvasRef} width={0} height={0} />
      <canvas
        ref={bgCanvasRef}
        onPointerDown={(e) => {
          startErasing(e);
        }}
        onPointerUp={(e) => {
          stopErasing(e);
        }}
        onMouseMove={(e) => {
          erase(e);
        }}
        width={0}
        height={0}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0)",
          position: "absolute",
          opacity: 0.5,
          top: `50%`,
          left: `50%`,
          transform: `translate(-50%, -50%)`,
        }}
      />
    </Box>
  );
};
