import { ToolName } from "@/tools/tool-name";
import React from "react";
import EffectsToolbar from "./EffectsToolbar";
import { useStore } from "@/state/store";
import { Drawer, useMediaQuery, useTheme, Toolbar, Paper } from "@mui/material";
import TextToolbar from "./TextToolbar";
import BackgroundToolbar from "./BackgroundToolbar";
import ImageToolbar from "./ImageToolbar";
import ShadowToolbar from "./ShadowToolbar";
import EraserToolbar from "./EraserToolbar";
import { Box } from "@mui/system";
const drawerWidth = 350;
export default function ToolbarSection() {
  const theme = useTheme();
  const largeScreen = useMediaQuery(theme.breakpoints.up("md"));
  const activeTool = useStore((s) => s.activeTool);
  const loading = useStore((s) => s.loading);
  return largeScreen ? (
    <Box
      sx={{
        width: drawerWidth,
        flex: "0 0 auto",
        flexGrow: 1,
        maxHeight: { xs: "calc(40% - 75px)", md: "100%" },
        overflow: "auto",
      }}
    >
      {!loading && activeTool && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
            },
            zIndex: 10000,
          }}
          anchor="right"
        >
          <Box className="p-8">{getToolNav(activeTool)}</Box>
        </Drawer>
      )}
    </Box>
  ) : (
    <>
      {!loading && activeTool && (
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            padding: 3,
            height: "calc(40% - 75px)",
            mb: `75px`,
          }}
        >
          {!loading && activeTool && getToolNav(activeTool)}
        </Paper>
      )}
    </>
  );
}

function getToolNav(active) {
  switch (active) {
    case ToolName.EFFECTS:
      return <EffectsToolbar />;
    case ToolName.TEXT:
      return <TextToolbar />;
    case ToolName.BACKGROUND:
      return <BackgroundToolbar />;
    case ToolName.IMAGE:
      return <ImageToolbar />;
    case ToolName.SHADOW:
      return <ShadowToolbar />;
    case ToolName.ERASER:
      return <EraserToolbar />;
    default:
      return null;
  }
}
