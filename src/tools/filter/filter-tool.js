import { fabric } from "fabric";
import { ObjectName } from "../../objects/object-name";
import { useStore } from "../../state/store";
import { state, tools } from "../../state/utils";
import { filterList } from "./filter-list";

export function ucFirst(string = "") {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export class FilterTool {
  constructor() {
    useStore.subscribe(
      (s) => s.history.pointer,
      () => {
        this.syncState();
      }
    );
  }

  /**
   * Apply specified filter to all images.
   */
  apply(filterName) {
    state().filter.select(filterName, this.hasOptions(filterName));
    const filter = this.getByName(filterName);
    if (this.isApplied(filter.name)) {
      this.remove(filter.name);
      return;
    }

    const newFilter = this.create(filter);
    this.getImages().forEach((image) => {
      image.filters?.push(newFilter);
      image.applyFilters?.();
    });

    this.syncState();
    tools().canvas.render();
  }

  /**
   * Remove specified filter from all images.
   */
  remove(filterName) {
    state().filter.deselect(filterName);
    const filter = this.getByName(filterName);
    this.getImages().forEach((image) => {
      const i = this.findFilterIndex(filter.name, image.filters);
      image.filters?.splice(i, 1);
      image.applyFilters?.();
    });
    this.syncState();
    tools().canvas.render();
  }

  /**
   * Get a list of all available filters.
   */
  getAll() {
    return filterList;
  }

  /**
   * Get configuration for specified filter.
   */
  getByName(name) {
    return filterList.find((f) => f.name === name);
  }

  /**
   * Check if specified filter is currently applied.
   */
  isApplied(name) {
    const mainImage = tools().canvas.getMainImage();
    if (!mainImage) return false;
    return this.findFilterIndex(name, mainImage.filters) > -1;
  }

  /**
   * Change specified value for an active filter.
   */
  applyValue(filterName, optionName, optionValue) {
    const filter = this.getByName(filterName);
    console.log(filter);
    this.getImages().forEach((image) => {
      console.log(image);
      const fabricFilter = (image.filters || []).find((curr) => {
        if (filter.uses) {
          return curr.type.toLowerCase() === filter.uses.toLowerCase();
        } else {
        }
        return curr.type.toLowerCase() === filter.name.toLowerCase();
      });
      if (!fabricFilter) return;

      fabricFilter[optionName] = optionValue;
      // filter has a special "apply" function that needs to be invoked
      if (filter.apply) {
        filter.apply(fabricFilter, optionName, optionValue);
      }

      image.applyFilters?.();
    });
    tools().canvas.render();
  }

  /**
   * Create a custom filter.
   */
  addCustom(name, filter, editableOptions, initialConfig) {
    const imgFilters = fabric.Image.filters;
    imgFilters[ucFirst(name)] = fabric.util.createClass(
      imgFilters.BaseFilter,
      filter
    );
    // @ts-ignore
    imgFilters[ucFirst(name)].fromObject = imgFilters.BaseFilter.fromObject;
    filterList.push({
      name,
      options: editableOptions,
      // @ts-ignore
      initialConfig,
    });
  }

  /**
   * @hidden
   */
  create(config) {
    const initialConfig = config.initialConfig || {};
    let filter;
    if (config.uses) {
      initialConfig.matrix = config.matrix;
      filter = new fabric.Image.filters[ucFirst(config.uses)](initialConfig);
    } else {
      Object.entries(config.options || {}).forEach(([key, value]) => {
        initialConfig[key] = value.current;
      });
      filter = new fabric.Image.filters[ucFirst(config.name)](initialConfig);
    }
    filter.name = config.name;
    return filter;
  }

  /**
   * @hidden
   */
  hasOptions(name) {
    return !!this.getByName(name)?.options;
  }

  /**
   * @hidden
   */
  findFilterIndex(name, fabricFilters) {
    if (!fabricFilters?.length) return -1;

    const filterConfig = this.getByName(name);

    return fabricFilters.findIndex((fabricFilter) => {
      return this.configMatchesFabricFilter(filterConfig, fabricFilter);
    });
  }

  /**
   * @hidden
   */
  syncState() {
    const applied = [];
    const fabricFilters = this.getImages()[0]?.filters || [];
    fabricFilters.forEach((fabricFilter) => {
      const filterConfig = this.getByFabricFilter(fabricFilter);
      if (filterConfig) {
        applied.push(filterConfig.name);
      }
    });
    useStore.setState({
      filter: {
        ...state().filter,
        applied,
      },
    });
  }

  getByFabricFilter(fabricFilter) {
    return filterList.find((filterConfig) => {
      return this.configMatchesFabricFilter(filterConfig, fabricFilter);
    });
  }

  configMatchesFabricFilter(filterConfig, fabricFilter) {
    const type = fabricFilter.type.toLowerCase().replace(" ", "");
    if (type === filterConfig.fabricType || type === filterConfig.name) {
      return true;
      // @ts-ignore
    } else if (
      filterConfig?.uses?.toLowerCase() === "gamma" &&
      type === filterConfig.uses
    ) {
      return true;
    }
    // match by matrix
    return (
      type === "convolute" &&
      this.matrixAreEqual(filterConfig.matrix, fabricFilter.matrix)
    );
  }

  matrixAreEqual(matrix1, matrix2) {
    if (!matrix1 || !matrix2 || matrix1.length !== matrix2.length) return false;
    for (let i = matrix1.length; i--; ) {
      if (matrix1[i] !== matrix2[i]) return false;
    }
    return true;
  }

  getImages() {
    return tools()
      .objects.getAll()
      .filter((obj) => {
        return obj.name === ObjectName.Image || ObjectName.MainImage;
      });
  }
}
