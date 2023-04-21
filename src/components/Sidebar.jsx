import { setActiveTool } from "@/objects/bind-to-fabric-selection-events";
import { useStore } from "@/state/store";
import { state, tools } from "@/state/utils";
import { ToolName } from "@/tools/tool-name";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Toolbar,
  useTheme,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { toast } from "react-hot-toast";

const drawerWidth = 150;
export default function Sidebar() {
  const theme = useTheme();
  const largeScreen = useMediaQuery(theme.breakpoints.up("md"));
  return largeScreen ? (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <>
        <Toolbar />
        <SidebarSection />
      </>
    </Drawer>
  ) : (
    <Paper
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10000 }}
      elevation={3}
    >
      <SidebarSection />
    </Paper>
  );
}

const SidebarSection = () => {
  const navItems = useStore((s) => s.config.ui?.nav?.items) || [];
  const activeTool = useStore((s) => s.activeTool);
  return (
    <Box sx={{ overflow: "auto" }}>
      <List
        sx={{
          display: "flex",
          flexDirection: { xs: "row", md: "column" },
          padding: 0,
        }}
      >
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton
              selected={activeTool === item.name}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "rgba(0,0,0,.1)",
                },
                "&:hover.Mui-selected": {
                  backgroundColor: "rgba(0,0,0,.1)",
                },
              }}
              onClick={async () => {
                if (!tools().canvas.getMainImage()) {
                  toast.error("Please add an image first...");
                  return;
                }
                await state().applyChanges();
                if (activeTool === item.name) {
                  state().setActiveTool(null, null);
                } else {
                  if (typeof item.action === "string") {
                    setActiveTool(item.action);
                  }
                }
              }}
              className="w-100 flex flex-col justify-center	items-center "
            >
              <ListItemIcon
                className="flex justify-center"
                sx={{
                  paddingTop: { xs: 2, sm: 0, md: 1 },
                  paddingBottom: { xs: 2, sm: 0 },
                  minWidth: "auto",
                }}
              >
                <item.icon size={24} />
              </ListItemIcon>
              <ListItemText
                sx={{
                  paddingBottom: { xs: 0, md: 1 },
                  display: { xs: "none", sm: "flex" },
                }}
                primary={
                  <span className="capitalize text-sm">{item.name}</span>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
