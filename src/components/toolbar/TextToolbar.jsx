import { Box, Select, Slider, MenuItem, TextField, Grid } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  AiOutlineAlignLeft,
  AiOutlineAlignRight,
  AiOutlineAlignCenter,
  AiOutlineBold,
  AiOutlineUnderline,
  AiOutlineItalic,
} from "react-icons/ai";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { state, tools } from "@/state/utils";
import { useStore } from "@/state/store";
import { loadFonts } from "@/tools/history/history-tool";
import { ToolbarSection } from "../ToolbarSection";
import { CustomIconButton } from "../CustomIconButton";

function ToggleButtons() {
  const [alignment, setAlignment] = useState("left");

  const handleAlignment = (_event, newAlignment) => {
    setAlignment(newAlignment);
    tools().objects.setValues({
      textAlign: newAlignment,
    });
    state().setDirty(true);
  };

  return (
    <div className="flex gap-6">
      <CustomIconButton
        icon={<AiOutlineAlignLeft />}
        shadow={true}
        title="left aligned"
        onClick={(e) => handleAlignment(e, "left")}
        active={alignment === "left"}
      />
      <CustomIconButton
        icon={<AiOutlineAlignCenter />}
        title="centered"
        shadow={true}
        onClick={(e) => handleAlignment(e, "center")}
        active={alignment === "center"}
      />
      <CustomIconButton
        icon={<AiOutlineAlignRight />}
        title="right aligned"
        shadow={true}
        onClick={(e) => handleAlignment(e, "right")}
        active={alignment === "right"}
      />
    </div>
  );
}

export default function TextToolbar() {
  const fontSize = useStore((s) => s.objects?.active?.editableProps?.fontSize);
  const fill = useStore((s) => s.objects?.active?.editableProps?.fill);
  const fontFamily = useStore(
    (s) => s.objects?.active?.editableProps?.fontFamily
  );
  const fonts = useStore((s) => s.config.tools.text.fonts);
  useEffect(() => {
    loadFonts(fonts);
  }, [fonts]);
  return (
    <Grid container rowSpacing={2} columnSpacing={2}>
      <Grid item xs={12}>
        <div className="mb-4 mx-auto text-center">
          <button
            onClick={() => {
              tools().text.add();
              state().setDirty(true);
            }}
            className="border border-pink-500 px-5 py-2 rounded-md text-pink-500 text-sm	hover:bg-pink-50"
          >
            Add Text Block
          </button>
        </div>
      </Grid>
      <Grid item xs={6} md={12}>
        <ToolbarSection title="Font Family">
          <Select
            onChange={(e) => {
              tools().objects.setValues({
                fontFamily: e.target.value,
              });
              state().setDirty(true);
            }}
            style={{
              fontFamily: `${fontFamily}, sans-serif`,
            }}
            fullWidth
            placeholder="Choose a Font Family"
            name="fontFamily"
            id="fontFamily"
            className="form-select border"
          >
            {fonts.map((font) => (
              <MenuItem
                key={font.family}
                style={{
                  fontFamily: font.family,
                }}
                value={font.family}
              >
                {font.family}
              </MenuItem>
            ))}
          </Select>
        </ToolbarSection>
      </Grid>
      <Grid item xs={6} md={12} sx={{ display: { xs: "block", md: "none" } }}>
        <ToolbarSection title="Font Size">
          <TextField
            value={fontSize || 20}
            onChange={(e) => {
              tools().objects.setValues({
                fontSize: e.target.value,
              });
              state().setDirty(true);
            }}
            fullWidth
            type="number"
            id="fontSize"
            name="fontSize"
            className="form-control"
          />
        </ToolbarSection>
      </Grid>
      <Grid item xs={5} md={12}>
        <ToolbarSection title="Alignment">
          <ToggleButtons />
        </ToolbarSection>
      </Grid>
      <Grid item xs={5} md={12}>
        <ToolbarSection title="Text Style">
          <StyleButtons />
        </ToolbarSection>
      </Grid>
      <Grid item xs={8} md={12}>
        <ToolbarSection title="Font Size">
          <Slider
            color={"primary"}
            value={fontSize || 20}
            aria-label="Opacity"
            valueLabelDisplay="auto"
            id="fontSize"
            name="fontSize"
            step={5}
            min={0}
            max={100}
            onChange={(e, v) => {
              tools().objects.setValues({
                fontSize: v,
              });
              state().setDirty(true);
            }}
          />
        </ToolbarSection>
      </Grid>
      <Grid item xs={4} md={12}>
        <ToolbarSection title="Color">
          <input
            onChange={(e) => {
              state().setDirty(true);
              tools().objects.setValues({ fill: e.target.value });
            }}
            value={fill}
            type="color"
            name="color"
            id="color"
            className="w-10 h-10 px-1 py-0.5 bg-white border border-black-500 cursor-pointer"
          />
        </ToolbarSection>
      </Grid>
    </Grid>
  );
}

const StyleButtons = () => {
  const fontStyle = useStore((s) => s.objects.active.editableProps.fontStyle);
  const underline = useStore((s) => s.objects.active.editableProps.underline);
  const fontWeight = useStore((s) => s.objects.active.editableProps.fontWeight);
  const [formats, setFormats] = useState([
    fontStyle,
    fontWeight === "bold" && "bold",
    underline && "underline",
  ]);
  const handleFormat = (event, newStyles) => {
    // If formats already includes the new style, remove it
    let newFormats;
    if (formats.includes(newStyles))
      newFormats = formats.filter((f) => f !== newStyles);
    else newFormats = [...formats, newStyles];
    setFormats(newFormats);
    tools().objects.setValues({
      underline: newFormats.includes("underline"),
      fontStyle: newFormats.includes("italic") ? "italic" : "",
      fontWeight: newFormats.includes("bold") ? "bold" : "normal",
    });
    state().setDirty(true);
  };
  return (
    <div className="flex gap-6">
      <CustomIconButton
        icon={<AiOutlineBold />}
        shadow={true}
        title="bold"
        active={formats.includes("bold")}
        onClick={(e) => handleFormat(e, "bold")}
      />
      <CustomIconButton
        icon={<AiOutlineItalic />}
        title="italic"
        active={formats.includes("italic")}
        shadow={true}
        onClick={(e) => handleFormat(e, "italic")}
      />
      <CustomIconButton
        icon={<AiOutlineUnderline />}
        title="underline"
        active={formats.includes("underline")}
        shadow={true}
        onClick={(e) => handleFormat(e, "underline")}
      />
    </div>
  );
};
