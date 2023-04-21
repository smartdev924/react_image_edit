import { useStore } from "@/state/store";
import {
  useEffect,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  forwardRef,
} from "react";

const ORIGIN = { x: 0, y: 0 };

// adjust to device to avoid blur
const { devicePixelRatio: ratio = 1 } = window;

function diffPoints(p1, p2) {
  return { x: p1.x - p2.x, y: p1.y - p2.y };
}

function addPoints(p1, p2) {
  return { x: p1.x + p2.x, y: p1.y + p2.y };
}

function scalePoint(p1, scale) {
  return { x: p1.x / scale, y: p1.y / scale };
}

const ZOOM_SENSITIVITY = 500; // bigger for lower zoom per scroll

const Canvas = forwardRef(
  /**
   *
   * @param {import("react").CanvasHTMLAttributes<HTMLCanvasElement>} props
   * @param {import("react").RefObject<HTMLCanvasElement>} canvasRef
   * @returns {JSX.Element}
   */
  ({ onPointerMove, onPointerDown, ...props }, canvasRef) => {
    const [context, setContext] = useState(null);
    const activeEraser = useStore((s) => s.eraser.isActive);
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState(ORIGIN);
    const [mousePos, setMousePos] = useState(ORIGIN);
    const [viewportTopLeft, setViewportTopLeft] = useState(ORIGIN);
    const isResetRef = useRef(false);
    const lastMousePosRef = useRef(ORIGIN);
    const lastOffsetRef = useRef(ORIGIN);

    // update last offset
    useEffect(() => {
      lastOffsetRef.current = offset;
    }, [offset]);

    // reset
    const reset = useCallback(
      (context) => {
        if (context && !isResetRef.current) {
          // adjust for device pixel density
          context.canvas.width = +props.width * ratio;
          context.canvas.height = +props.height * ratio;
          context.scale(ratio, ratio);
          setScale(1);

          // reset state and refs
          setContext(context);
          setOffset(ORIGIN);
          setMousePos(ORIGIN);
          setViewportTopLeft(ORIGIN);
          lastOffsetRef.current = ORIGIN;
          lastMousePosRef.current = ORIGIN;

          // this thing is so multiple resets in a row don't clear canvas
          isResetRef.current = true;
        }
      },
      [props.width, props.height]
    );

    // functions for panning
    const pointermove = useCallback(
      (event) => {
        if (context) {
          const lastMousePos = lastMousePosRef.current;
          const currentMousePos = { x: event.pageX, y: event.pageY }; // use document so can pan off element
          lastMousePosRef.current = currentMousePos;

          const mouseDiff = diffPoints(currentMousePos, lastMousePos);
          setOffset((prevOffset) => addPoints(prevOffset, mouseDiff));
        }
      },
      [context]
    );

    const mouseUp = useCallback(() => {
      document.removeEventListener("pointermove", pointermove);
      document.removeEventListener("mouseup", mouseUp);
    }, [pointermove]);

    const startPan = useCallback(
      (event) => {
        document.addEventListener("pointermove", pointermove);
        document.addEventListener("mouseup", mouseUp);
        lastMousePosRef.current = { x: event.pageX, y: event.pageY };
      },
      [pointermove, mouseUp]
    );

    // pan when offset or scale changes
    useLayoutEffect(() => {
      if (context && lastOffsetRef.current) {
        const offsetDiff = scalePoint(
          diffPoints(offset, lastOffsetRef.current),
          scale
        );
        context.translate(offsetDiff.x, offsetDiff.y);
        setViewportTopLeft((prevVal) => diffPoints(prevVal, offsetDiff));
        isResetRef.current = false;
      }
    }, [context, offset, scale]);
    // add event listener on canvas for mouse position
    useEffect(() => {
      const canvasElem = canvasRef.current;
      if (canvasElem === null) {
        return;
      }

      function handleUpdateMouse(event) {
        event.preventDefault();
        if (canvasRef.current) {
          const viewportMousePos = { x: event.clientX, y: event.clientY };
          const topLeftCanvasPos = {
            x: canvasRef.current.offsetLeft,
            y: canvasRef.current.offsetTop,
          };
          setMousePos(diffPoints(viewportMousePos, topLeftCanvasPos));
        }
      }

      canvasElem.addEventListener("pointermove", (e) => {
        if (activeEraser) {
          onPointerMove(e);
        } else {
          handleUpdateMouse(e);
        }
      });
      canvasElem.addEventListener("wheel", (e) => {
        handleUpdateMouse(e);
      });
      return () => {
        canvasElem.removeEventListener("pointermove", (e) => {
          if (activeEraser) {
            onPointerMove(e);
          } else {
            handleUpdateMouse(e);
          }
        });
        canvasElem.removeEventListener("wheel", handleUpdateMouse);
      };
    }, [activeEraser]);

    // add event listener on canvas for zoom
    useEffect(() => {
      const canvasElem = canvasRef.current;
      if (canvasElem === null) {
        return;
      }

      // this is tricky. Update the viewport's "origin" such that
      // the mouse doesn't move during scale - the 'zoom point' of the mouse
      // before and after zoom is relatively the same position on the viewport
      function handleWheel(event) {
        console.log(event);
        event.preventDefault();
        if (context) {
          const zoom = 1 - event.deltaY / ZOOM_SENSITIVITY;
          const viewportTopLeftDelta = {
            x: (mousePos.x / scale) * (1 - 1 / zoom),
            y: (mousePos.y / scale) * (1 - 1 / zoom),
          };
          const newViewportTopLeft = addPoints(
            viewportTopLeft,
            viewportTopLeftDelta
          );

          context.translate(viewportTopLeft.x, viewportTopLeft.y);
          context.scale(zoom, zoom);
          context.translate(-newViewportTopLeft.x, -newViewportTopLeft.y);

          setViewportTopLeft(newViewportTopLeft);
          setScale(scale * zoom);
          isResetRef.current = false;
        }
      }

      canvasElem.addEventListener("wheel", handleWheel);
      return () => canvasElem.removeEventListener("wheel", handleWheel);
    }, [context, mousePos.x, mousePos.y, viewportTopLeft, scale]);
    useEffect(() => {
      reset(canvasRef.current.getContext("2d"));
    }, [reset]);
    return (
      <canvas
        onPointerDown={(e) => {
          if (activeEraser) {
            onPointerDown(e);
          } else {
            startPan(e);
          }
        }}
        ref={canvasRef}
        width={+props.width * ratio}
        height={+props.height * ratio}
        {...props}
      ></canvas>
    );
  }
);

export default Canvas;
