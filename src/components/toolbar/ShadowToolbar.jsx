import { useStore } from "@/state/store";
import { state } from "@/state/utils";
import { tools } from "@/utils/utils";
import { Grid, Slider } from "@mui/material";
import Color from "color";
import { fabric } from "fabric";
import { useSyncExternalStore } from "react";
import { ToolbarSection } from "../ToolbarSection";

const shadowDefaults = {
  color: "rgba(0, 0, 0, 0.6)",
  blur: 10,
  offsetX: 10,
  offsetY: 10,
};

let listeners = [];

export const shadowStore = {
  changeValue(key, value) {
    shadowDefaults[key] = value;
    emitChange();
  },
  subscribe(listener) {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getSnapshot() {
    return shadowDefaults;
  },
};

function emitChange() {
  for (let listener of listeners) {
    listener();
  }
}

export default function ShadowToolbar() {
  const shadow =
    useStore((s) => s.objects.active.editableProps.shadow) || shadowDefaults;
  const snapshot = useSyncExternalStore(
    shadowStore.subscribe,
    shadowStore.getSnapshot
  );
  return (
    <Grid container rowSpacing={3} columnSpacing={3}>
      <Grid item xs={6} sm={4} md={12}>
        <ToolbarSection title="Activate">
          <input
            type="checkbox"
            className="toggle toggle-primary"
            onChange={(e) => {
              state().setDirty(true);
              tools().objects.setValues(
                {
                  shadow: e.target.checked ? modifiedShadow(shadow) : null,
                },
                tools().canvas.getMainImage()
              );
            }}
          />
        </ToolbarSection>
      </Grid>
      <Grid item xs={6} sm={4} md={12}>
        <ToolbarSection title="Opacity">
          <Slider
            color={"primary"}
            value={Color(snapshot.color).alpha()}
            aria-label="Opacity"
            valueLabelDisplay="auto"
            step={0.1}
            min={0}
            max={1}
            onChange={(e, v) => {
              state().setDirty(true);
              const color = Color(Color(snapshot.color).hex())
                .rgb()
                // @ts-ignore
                .alpha(v)
                .string();
              tools().objects.setValues(
                {
                  shadow: modifiedShadow({ color }),
                },
                tools().canvas.getMainImage()
              );
              shadowStore.changeValue("color", color);
            }}
          />
        </ToolbarSection>
      </Grid>
      <Grid item xs={6} sm={4} md={12}>
        <ToolbarSection title="Shadow X Offset">
          <Slider
            color={"primary"}
            value={snapshot.offsetX}
            aria-label="Opacity"
            valueLabelDisplay="auto"
            step={5}
            min={-100}
            max={100}
            onChange={(e, v) => {
              state().setDirty(true);
              tools().objects.setValues(
                {
                  shadow: modifiedShadow({
                    offsetX: v,
                  }),
                },
                tools().canvas.getMainImage()
              );
              shadowStore.changeValue("offsetX", v);
            }}
          />
        </ToolbarSection>
      </Grid>
      <Grid item xs={6} sm={4} md={12}>
        <ToolbarSection title="Shadow Y Offset">
          <Slider
            color={"primary"}
            value={snapshot.offsetY}
            aria-label="Opacity"
            valueLabelDisplay="auto"
            step={5}
            min={-100}
            max={100}
            onChange={(e, v) => {
              state().setDirty(true);
              tools().objects.setValues(
                {
                  shadow: modifiedShadow({
                    offsetY: v,
                  }),
                },
                tools().canvas.getMainImage()
              );
              shadowStore.changeValue("offsetY", v);
            }}
          />
        </ToolbarSection>
      </Grid>
      <Grid item xs={6} sm={4} md={12}>
        <ToolbarSection title="Shadow Blur">
          <Slider
            color={"primary"}
            value={snapshot.blur}
            aria-label="Opacity"
            valueLabelDisplay="auto"
            step={10}
            min={0}
            max={200}
            onChange={(e, v) => {
              state().setDirty(true);
              tools().objects.setValues(
                {
                  shadow: modifiedShadow({
                    blur: v,
                  }),
                },
                tools().canvas.getMainImage()
              );
              shadowStore.changeValue("blur", v);
            }}
          />
        </ToolbarSection>
      </Grid>
      <Grid item xs={6} sm={4} md={12}>
        <ToolbarSection title="Shadow Color">
          <input
            type="color"
            value={Color(snapshot.color).alpha(1).hex()}
            onChange={(e) => {
              state().setDirty(true);
              const color = Color(e.target.value)
                .rgb()
                .alpha(Color(snapshot.color).alpha())
                .string();
              tools().objects.setValues(
                {
                  shadow: modifiedShadow({
                    color,
                  }),
                },
                tools().canvas.getMainImage()
              );

              shadowStore.changeValue("color", color);
            }}
            className="w-10 h-10 px-1 py-0.5 bg-white border border-black-500 cursor-pointer"
          />
        </ToolbarSection>
      </Grid>
      {/* <div className="px-4">
        <label className="cursor-pointer">
          <span className="label-text">Opacity</span>
        </label>
        <br />
        <Slider
          value={Color(snapshot.color).alpha()}
          aria-label="Opacity"
          valueLabelDisplay="auto"
          step={0.1}
          min={0}
          max={1}
          onChange={(e, v) => {
            state().setDirty(true);
            const color = Color(Color(snapshot.color).hex())
              .rgb()
              // @ts-ignore
              .alpha(v)
              .string();
            tools().objects.setValues(
              {
                shadow: modifiedShadow({ color }),
              },
              tools().canvas.getMainImage()
            );
            shadowStore.changeValue("color", color);
          }}
        />
      </div> 
      <div className="px-4">
        <label className="cursor-pointer">
          <span className="label-text">Shadow X Offset</span>
        </label>
        <br />
        <Slider
          value={snapshot.offsetX}
          aria-label="Opacity"
          valueLabelDisplay="auto"
          step={5}
          min={-100}
          max={100}
          onChange={(e, v) => {
            state().setDirty(true);
            tools().objects.setValues(
              {
                shadow: modifiedShadow({
                  offsetX: v,
                }),
              },
              tools().canvas.getMainImage()
            );
            shadowStore.changeValue("offsetX", v);
          }}
        />
      </div>
      <div className="px-4">
        <label className="cursor-pointer">
          <span className="label-text">Shadow Y Offset</span>
        </label>
        <br />
        <Slider
          value={snapshot.offsetY}
          aria-label="Opacity"
          valueLabelDisplay="auto"
          step={5}
          min={-100}
          max={100}
          onChange={(e, v) => {
            state().setDirty(true);
            tools().objects.setValues(
              {
                shadow: modifiedShadow({
                  offsetY: v,
                }),
              },
              tools().canvas.getMainImage()
            );
            shadowStore.changeValue("offsetY", v);
          }}
        />
      </div>
      <div className="px-4">
        <label className="cursor-pointer">
          <span className="label-text">Shadow Blur</span>
        </label>
        <br />
        <Slider
          value={snapshot.blur}
          aria-label="Opacity"
          valueLabelDisplay="auto"
          step={10}
          min={0}
          max={200}
          onChange={(e, v) => {
            state().setDirty(true);
            tools().objects.setValues(
              {
                shadow: modifiedShadow({
                  blur: v,
                }),
              },
              tools().canvas.getMainImage()
            );
            shadowStore.changeValue("blur", v);
          }}
        />
      </div>
      <div className="px-4">
        <label className="cursor-pointer">
          <span className="label-text">Shadow Color</span>
        </label>
        <br />
        <input
          type="color"
          value={Color(snapshot.color).alpha(1).hex()}
          onChange={(e) => {
            state().setDirty(true);
            const color = Color(e.target.value)
              .rgb()
              .alpha(Color(snapshot.color).alpha())
              .string();
            tools().objects.setValues(
              {
                shadow: modifiedShadow({
                  color,
                }),
              },
              tools().canvas.getMainImage()
            );

            shadowStore.changeValue("color", color);
          }}
        />
      </div> */}
    </Grid>
  );
}

function modifiedShadow(options) {
  console.log(options);
  const current = tools().canvas.getMainImage()?.shadow;
  if (current) {
    Object.entries(options).forEach(([key, val]) => {
      current[key] = val;
    });
    return current;
  }
  return new fabric.Shadow({
    ...shadowStore.getSnapshot(),
    ...options,
  });
}
