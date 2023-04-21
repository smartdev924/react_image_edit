import { useStore } from "@/state/store";
import { state, tools } from "@/state/utils";
import {
  filterNameMessages,
  filterOptionMessages,
} from "@/tools/filter/filter-list";
import { Box, Divider, Drawer, Grid, Slider } from "@mui/material";
import { useEffect, useState } from "react";
import { ToolbarSection } from "../ToolbarSection";

export default function EffectsToolbar() {
  const filters = tools().filter.getAll();
  const [active, setActive] = useState(null);
  useEffect(() => {
    tools().filter.syncState();
  }, []);
  return (
    <Grid container rowSpacing={3} columnSpacing={3}>
      {filters.map((filter) => (
        <Grid item xs={6} sm={3} md={6} key={filter.name}>
          <FilterButton active={active} setActive={setActive} filter={filter} />
        </Grid>
      ))}
      <Grid item xs={12}>
        {tools().filter.hasOptions(active?.name) && (
          <FilterOptions filter={active} />
        )}
      </Grid>
    </Grid>
  );
}

const FilterButton = ({ filter, active, setActive }) => {
  const isActive = useStore((s) => s.filter.applied.includes(filter.name));
  const isActiveFilter = active?.name === filter.name;
  return (
    <button
      onClick={() => {
        setActive(filter);
        if (isActive) {
          tools().filter.remove(filter.name);
        } else {
          tools().filter.apply(filter.name);
        }
      }}
      className={`border border-black-100 shadow-md rounded  py-2 hover:bg-pink-50 ${
        isActive
          ? isActiveFilter
            ? "bg-pink-50"
            : "bg-pink-100"
          : "bg-transparent"
      } w-full text-sm`}
    >
      {filterNameMessages[filter.name].name}
    </button>
  );
};

const FilterOptions = ({ filter }) => {
  const options = filter.options;
  return (
    <div>
      {Object.entries(options).map(([key, value]) => {
        return (
          <Option
            selectedFilter={filter.name}
            name={key}
            value={value}
            key={key}
          />
        );
      })}
    </div>
  );
};

const Option = ({ name, value, selectedFilter }) => {
  const applyValue = (optionName, value) => {
    tools().filter?.applyValue(selectedFilter, optionName, value);
    state().setDirty(true);
  };
  return (
    <ToolbarSection title={filterOptionMessages[name]?.name || name}>
      <Slider
        color={"primary"}
        defaultValue={value.current}
        onChange={(e, v) => {
          applyValue(name, v);
        }}
        min={value.min}
        max={value.max}
        step={value.step || 1}
        valueLabelDisplay="auto"
      />
    </ToolbarSection>
  );
};
