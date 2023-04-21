import { state, tools } from "@/state/utils";
import { CustomIconButton } from "../CustomIconButton";
import { FiRotateCcw, FiRotateCw } from "react-icons/fi";
import { TbFlipHorizontal, TbFlipVertical } from "react-icons/tb";
import { ToolbarSection } from "../ToolbarSection";
import { Grid, Slider } from "@mui/material";
import { useStore } from "@/state/store";
import { useEffect } from "react";
import { ucFirst } from "@/tools/filter/filter-tool";

export default function ImageToolbar() {
  // tools().transform.resetStraightenAnchor();
  const filters = useStore((s) => s.editor.tools.filter.getAll());
  console.log(filters);
  return (
    <Grid container rowSpacing={3} columnSpacing={3}>
      <Grid item xs={6} md={12}>
        <ToolbarSection title="Rotate">
          <div className="flex gap-6">
            <CustomIconButton
              icon={<FiRotateCcw />}
              shadow={true}
              title="Rotate Left"
              onClick={() => {
                tools().transform.rotateLeft();
                state().setDirty(true);
              }}
            />
            <CustomIconButton
              icon={<FiRotateCw />}
              title="Rotate Right"
              shadow={true}
              onClick={() => {
                tools().transform.rotateRight();
                state().setDirty(true);
              }}
            />
          </div>
        </ToolbarSection>
      </Grid>
      <Grid item xs={6} md={12}>
        <ToolbarSection title="Flip">
          <div className="flex gap-6">
            <CustomIconButton
              shadow={true}
              icon={<TbFlipHorizontal />}
              title="Flip Vertical"
              onClick={() => {
                tools().transform.flip("horizontal");
                state().setDirty(true);
              }}
            />
            <CustomIconButton
              shadow={true}
              icon={<TbFlipVertical />}
              title="Flip Horizontal"
              onClick={() => {
                tools().transform.flip("vertical");
                state().setDirty(true);
              }}
            />
          </div>
        </ToolbarSection>
      </Grid>
      <Grid item xs={12} md={12}>
        {["brightness", "contrast"].map((filterName) => {
          const filter = filters.find((f) => f.name === filterName);
          return (
            <ToolbarSection key={filterName} title={ucFirst(filterName)}>
              <div className="flex gap-6">
                <Slider
                  defaultValue={filter?.options?.[filterName]?.current || 0}
                  onChange={(e, value) => {
                    tools().filter.apply(filterName);
                    const applyValue = (optionName, value) => {
                      console.log(optionName, value);
                      tools().filter.applyValue(filterName, optionName, value);
                      state().setDirty(true);
                    };
                    applyValue(filterName, value);
                  }}
                  min={filter?.options?.[filterName]?.min || 0}
                  max={filter?.options?.[filterName]?.max || 0}
                  step={filter?.options?.[filterName]?.step || 0}
                  valueLabelDisplay="auto"
                />
              </div>
            </ToolbarSection>
          );
        })}
      </Grid>
    </Grid>
  );
}
