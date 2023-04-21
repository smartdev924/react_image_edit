import { useStore } from "@/state/store";
import { tools } from "@/state/utils";
import { Grid, MenuItem, Select, Slider } from "@mui/material";
import { ToolbarSection } from "../ToolbarSection";
// From -10 to 10
const boundries = Array.from({ length: 21 }, (_, i) => ({
  name: `${i - 10}0 %`,
  value: i - 10,
}));
const featherings = Array.from({ length: 21 }, (_, i) => ({
  name: `${i - 10}0 %`,
  value: i - 10,
}));

export default function EraserToolbar() {
  const { feathering, offset, brush } = useStore((s) => s.eraser);
  return (
    <Grid container rowSpacing={3} columnSpacing={3}>
      <Grid item xs={6} md={12}>
        <ToolbarSection title="Offset the boundries">
          <Select
            onChange={(e) => {
              tools().brush.setOffset(e.target.value);
            }}
            value={offset}
            fullWidth
            placeholder="Choose Boundries"
            name="boundries"
            id="boundries"
            className="form-select border"
          >
            {boundries.map((data, index) => (
              <MenuItem key={index} value={data.value}>
                {data.name}
              </MenuItem>
            ))}
          </Select>
        </ToolbarSection>
      </Grid>
      <Grid item xs={6} md={12}>
        <ToolbarSection title="Feathering">
          <Select
            onChange={(e) => {
              tools().brush.setFeathering(e.target.value);
            }}
            value={feathering}
            fullWidth
            placeholder="Choose Feathering"
            name="feathering"
            id="feathering"
            className="form-select border"
          >
            {featherings.map((data, index) => (
              <MenuItem key={index} value={data.value}>
                {data.name}
              </MenuItem>
            ))}
          </Select>
        </ToolbarSection>
      </Grid>

      <Grid item xs={12}>
        <ToolbarSection title="Brush Width">
          <Slider
            color={"primary"}
            aria-label="Opacity"
            valueLabelDisplay="auto"
            step={0.1}
            value={brush}
            min={3}
            max={40}
            onChange={(e, v) => {
              tools().brush.setBrushWidth(v);
            }}
          />
        </ToolbarSection>
      </Grid>
      <Grid item xs={12}>
        <div className="text-center">
          <button
            onClick={async () => {
              await tools().brush.reset();
              await tools().brush.drawImage();
            }}
            className="border border-pink-500 px-5 py-2 rounded-md text-pink-500 text-sm	hover:bg-pink-50"
          >
            Reset to default
          </button>
        </div>
      </Grid>
    </Grid>
  );
}
