import { DEFAULT_GRADIENTS } from "@/config/default-gradients";
import { tools } from "@/state/utils";
import { state } from "@/utils/utils";
import { Box, Grid } from "@mui/material";
import { fabric } from "fabric";
import { UploadedFile } from "@/tools/import/import-tool";
import { ToolbarSection } from "../ToolbarSection";
import { createImage } from "@/tools/brush/brush-tool";
const colors = [
  "white",
  "black",
  "red",
  "green",
  "blue",
  "yellow",
  "orange",
  "purple",
  "pink",
  "brown",
  "PaleVioletRed",
  "Gold",
  "DarkKhaki",
  "Lavender",
  "SlateBlue",
  "Olive",
  "Teal",
  "SteelBlue",
];
export default function BackgroundToolbar() {
  return (
    <Grid container rowSpacing={3} columnSpacing={3}>
      <Grid item xs={12} sm={9} md={12}>
        <ToolbarSection title="Predifined Colors">
          <div className="border p-3 rounded-md flex gap-3 flex-wrap">
            {colors.map((color) => (
              <button
                className={`shadow-md rounded w-9 h-9`}
                style={{ backgroundColor: color, borderColor: color }}
                onClick={() => {
                  tools().canvas.setBackgroundColor(color);
                  state().setDirty(true);
                }}
              />
            ))}
          </div>
        </ToolbarSection>
      </Grid>
      <Grid item xs={12} sm={3} md={12}>
        <ToolbarSection title="Custom Color:">
          <input
            type="color"
            onChange={(e) => {
              tools().canvas.setBackgroundColor(e.target.value);
              state().setDirty(true);
            }}
            className="w-10 h-10 px-1 py-0.5 bg-white border border-black-500 cursor-pointer"
          />
        </ToolbarSection>
      </Grid>
      <Grid item xs={12}>
        <ToolbarSection title="Predefined Background">
          <div className="border p-3 rounded-md flex gap-3 flex-wrap">
            {DEFAULT_GRADIENTS.map((gradient, i) => (
              <button
                className={`shadow-md rounded w-9 h-9`}
                style={{
                  backgroundImage: `${gradient.type}-gradient(
              ${gradient.colorStops
                .map((stop) => `${stop.color} ${stop.offset * 100}%`)
                .join(", ")}
            )`,
                }}
                onClick={() => {
                  const gr = new fabric.Gradient(gradient);
                  tools().canvas.setGradientBackground(gr);
                  state().setDirty(true);
                }}
              />
            ))}
          </div>
        </ToolbarSection>
      </Grid>
      <Grid item xs={12}>
        <ToolbarSection title="Custom Background">
          <label className="block">
            <span className="sr-only">Upload Background</span>
            <input
              type="file"
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 fle:text-sm file:cursor-pointer file:bg-white-50  file:text-black-700 hover:file:bg-white-100"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                const data = new UploadedFile(file);
                const canvas = document.createElement("canvas");
                canvas.width = state().stageSize.width;
                canvas.height = state().stageSize.height;
                const ctx = canvas.getContext("2d");
                const b64 = await data.data;
                const img = await createImage(b64);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const pattern = new fabric.Pattern({
                  source: canvas.toDataURL(),
                  repeat: "no-repeat",
                });
                tools().canvas.setBackgroundPattern(pattern);
                state().setDirty(true);
              }}
            />
          </label>
        </ToolbarSection>
      </Grid>
    </Grid>
  );
}
