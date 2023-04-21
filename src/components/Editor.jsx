import { useStore } from "@/state/store";
import { state, tools } from "@/state/utils";
import deepmerge from "deepmerge";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useDropzone } from "react-dropzone";
import { Toaster, toast } from "react-hot-toast";
import {
  UploadedFile,
  buildUploadInputAccept,
  imgContentTypes,
  stateContentType,
} from "../tools/import/import-tool";
import { initTools } from "../tools/init-tools";
import { LoadingIndicator } from "./Loader";
import Sidebar from "./Sidebar";
import { CanvasWrapper } from "./stage/canvas-wrapper";

import { ActiveToolOverlay } from "@/state/editor-state";
import { Box, Toolbar as MuiToolbar, useTheme } from "@mui/material";
import useResizeObserver from "use-resize-observer";
import {
  FiRotateCcw,
  FiRotateCw,
  FiCrop,
  FiZoomOut,
  FiZoomIn,
} from "react-icons/fi";
import { MdDone, MdClose } from "react-icons/md";
import { CustomIconButton } from "./CustomIconButton";
import ToolbarSection from "./toolbar";
import { ModalSection } from "./modalSection";
import { ToolName } from "@/tools/tool-name";
import { useParams } from "react-router-dom";

/**
 *
 * @param {HTMLElement} el
 * @param {(e: DOMRectReadOnly) => void} callback
 * @returns {() => void}
 */
export function observeSize(el, callback) {
  const observer = new ResizeObserver((entries) => {
    const rect = entries[0].contentRect;
    callback(rect);
  });
  observer.observe(el);
  return () => observer.unobserve(el);
}

export function ImageEditor() {
  const canvasRef = useRef(null);
  const editCanvasRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const mainRef = useRef(null);
  const theme = useTheme();
  const { id } = useParams();
  const activeTool = useStore((s) => s.activeTool);
  const activeToolOverlay = useStore((s) => s.activeToolOverlay);
  const brushType = useStore((s) => s.eraser.type);
  const stageWidth = useStore((s) => s.stageSize.width);
  const stageHeight = useStore((s) => s.stageSize.height);
  const panContainerRef = useRef(null);
  const { width, height } = useResizeObserver({
    ref: panContainerRef,
  });
  const { width: canvasWidth, height: canvasHeight } = useResizeObserver({
    ref: canvasRef,
  });
  useEffect(() => {
    state().setStageSize({ ...state().stageSize, width, height });
  }, [width, height]);
  useEffect(() => {
    state().setCanvasSize({
      ...state().canvasSize,
      width: canvasWidth,
      height: canvasHeight,
    });
  }, [canvasWidth, canvasHeight]);
  const isDirty = useStore((s) => s.dirty);

  useEffect(() => {
    // editor already booted
    if (state().fabric) return;
    initTools(canvasRef.current, editCanvasRef.current, bgCanvasRef.current);
    if (state().config.ui?.defaultTool) {
      state().setActiveTool(state().config.ui?.defaultTool, null);
    }
    tools()
      .canvas.loadInitialContent()
      .then(async () => {
        state().config.onLoad?.(state().editor);
        if (id) {
          console.log();
          state().eraser.setMask(
            `https://app.sellersimagepro.com/uploads/mask/${id}.png`
          );
          tools().brush.setOriginalImage(
            `https://app.sellersimagepro.com/uploads/input/${id}.jpg`
          );
          state().setImageId(id);
          await tools().import.openBackgroundImage(
            `https://app.sellersimagepro.com/uploads/input/${id}.jpg`
          );
          state().setActiveTool("eraser", null);
        }
      });
  }, [id]);
  const dimensions = useStore((s) => s.original);
  // make sure css variables are added before editor ui is rendered
  useLayoutEffect(() => {
    if (activeTool) {
      tools().zoom.fitToScreen();
    }
  }, [dimensions, activeTool]);
  const handleRestore = () => {
    tools().brush.setRestore(brushType === "eraser" ? "restore" : "eraser");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        minHeight: "100vh",
        overflowX: "hidden",
        maxHeight: { xs: "100dvh", md: "100%" },
      }}
    >
      <Sidebar />
      <Box
        component="main"
        sx={{
          p: { xs: 0, md: 2 },
          py: { xs: 3 },
          width: {
            xs: "100%",
            md:
              activeTool === ToolName.ERASER ? `calc(100% - ${350}px)` : "100%",
          },
          height: { xs: "60%", md: "100%" },
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
          position: { xs: "sticky", md: "relative" },
          top: { xs: 0, md: "unset" },
          backgroundColor: { xs: "white", md: "unset" },
          zIndex: { xs: 100, md: "unset" },
          borderBottom: { xs: "1px solid #e0e0e0", md: "unset" },
        }}
      >
        <Box
          sx={{
            height: "100%",
            position: "relative",
            flexGrow: 1,
            width: "100%",
          }}
        >
          <MuiToolbar className="mx-auto mb-5">
            <section className="flex gap-10 mx-auto flex-wrap justify-center">
              <div className="drop-shadow-md flex">
                <CustomIconButton
                  icon={<FiRotateCcw />}
                  title="Undo"
                  onClick={() => {
                    if (tools().history.canUndo()) {
                      tools().history.undo();
                    } else toast.error("Nothing to undo");
                  }}
                />
                <CustomIconButton
                  icon={<FiRotateCw />}
                  title="Redo"
                  onClick={() => {
                    if (tools().history.canRedo()) {
                      tools().history.redo();
                    } else toast.error("Nothing to redo");
                  }}
                />
              </div>

              <div className="drop-shadow-md flex">
                <CustomIconButton
                  icon={<MdClose />}
                  title="Cancel"
                  onClick={async () => {
                    await state().cancelChanges();
                    state().setActiveTool(null, null);
                  }}
                  disabled={!isDirty}
                />
                <CustomIconButton
                  icon={<MdDone />}
                  title="Done"
                  onClick={async () => {
                    await state().applyChanges();
                    state().setActiveTool(null, null);
                  }}
                  disabled={!isDirty}
                />
              </div>

              <div className="drop-shadow-md flex">
                <CustomIconButton
                  onClick={() => {
                    tools().zoom.zoomIn();
                  }}
                  icon={<FiZoomIn />}
                  title="Zoom In"
                />
                <CustomIconButton
                  onClick={() => {
                    tools().zoom.zoomOut();
                  }}
                  icon={<FiZoomOut />}
                  title="Zoom Out"
                />
                {theme.breakpoints.up("lg") && (
                  <CustomIconButton
                    icon={<FiCrop />}
                    title="Crop"
                    onClick={() => {
                      state().setActiveTool(null, ActiveToolOverlay.Crop);
                      state().setDirty(true);
                    }}
                    disabled={activeToolOverlay === ActiveToolOverlay.Crop}
                  />
                )}
              </div>
              {activeTool === ToolName.ERASER && (
                <div className="drop-shadow-md flex">
                  <CustomIconButton
                    icon={"Restore"}
                    custom
                    title="Restore"
                    onClick={handleRestore}
                    disabled={brushType === "eraser"}
                  />
                  <CustomIconButton
                    icon={"Eraser"}
                    custom
                    title="Eraser"
                    onClick={handleRestore}
                    disabled={brushType === "restore"}
                  />
                </div>
              )}
            </section>
          </MuiToolbar>
          <main className="relative max-h-screen flex-1 flex overflow-hidden outline-none ">
            {/* @ts-ignore */}
            <CanvasWrapper
              // @ts-ignore
              panContainerRef={panContainerRef}
              ref={canvasRef}
              editCanvasRef={editCanvasRef}
              bgCanvasRef={bgCanvasRef}
              mainRef={mainRef}
            />
            <LoadingIndicator />
          </main>
          <div className="text-center py-5">
            <ModalSection />
          </div>
        </Box>
      </Box>
      <ToolbarSection />
    </Box>
  );
}
