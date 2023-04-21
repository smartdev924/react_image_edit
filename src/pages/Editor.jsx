import { ImageEditor } from "@/components/Editor";
import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#EC4899",
    },
  },
});
export default function EditorPage() {
  return (
    <div>
      <ThemeProvider theme={theme}>
        <ImageEditor />
      </ThemeProvider>
    </div>
  );
}
