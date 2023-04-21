export const filterList = [
  { name: "grayscale" },
  { name: "sepia" },
  {
    name: "blur",
    uses: "Convolute",
    matrix: [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9],
  },
  {
    name: "HueRotation",
    options: {
      rotation: { type: "slider", current: 0.1, min: -2, max: 2, step: 0.1 },
    },
    fabricType: "huerotation",
  },
  {
    name: "pixelate",
    options: {
      blocksize: { type: "slider", min: 1, max: 40, current: 6 },
    },
  },
  {
    name: "saturation",
    options: {
      saturation: { type: "slider", current: 0.1, min: -1, max: 1, step: 0.1 },
    },
    fabricType: "Saturation",
  },
  { name: "vintage" },
  {
    name: "emboss",
    uses: "Convolute",
    matrix: [1, 1, 1, 1, 0.7, -1, -1, -1, -1],
  },
  {
    name: "noise",
    options: {
      noise: { type: "slider", current: 40, min: 10, max: 600, step: 10 },
    },
  },
  {
    name: "sharpen",
    uses: "Convolute",
    matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0],
  },
  { name: "polaroid" },
  { name: "kodachrome" },
  { name: "technicolor" },
  { name: "brownie" },
  {
    name: "brightness",
    options: {
      brightness: { type: "slider", current: 0.1, min: -1, max: 1, step: 0.1 },
    },
  },
  {
    name: "contrast",
    options: {
      contrast: { type: "slider", current: 0, min: -1, max: 1, step: 0.1 },
    },
  },
];

export const filterNameMessages = {
  grayscale: { name: "Grayscale", description: "Filter name" },
  sepia: { name: "Sepia", description: "Filter name" },
  blur: { name: "Blur", description: "Filter name" },
  HueRotation: {
    name: "Color Correction",
    description: "Filter name",
  },
  blackWhite: { name: "Black & White", description: "Filter name" },
  sharpen: { name: "Sharpen", description: "Filter name" },
  invert: { name: "Invert", description: "Filter name" },
  vintage: { name: "Vintage", description: "Filter name" },
  polaroid: { name: "Polaroid", description: "Filter name" },
  kodachrome: { name: "Kodachrome", description: "Filter name" },
  technicolor: { name: "Technicolor", description: "Filter name" },
  brownie: { name: "Brownie", description: "Filter name" },
  removeColor: { name: "Remove Color", description: "Filter name" },
  brightness: { name: "Brightness", description: "Filter name" },
  gamma: { name: "Gamma", description: "Filter name" },
  noise: { name: "Noise", description: "Filter name" },
  pixelate: { name: "Pixelate", description: "Filter name" },
  emboss: { name: "Emboss", description: "Filter name" },
  blendColor: { name: "Blend Color", description: "Filter name" },
  contrast: { name: "Contrast", description: "Filter name" },
  saturation: { name: "saturation", description: "Filter name" },
  vibrance: { name: "Vibrance", description: "Filter name" },
  exposure: { name: "Exposure", description: "Filter name" },
};

export const filterOptionMessages = {
  distance: { name: "distance", description: "Filter options" },
  color: { name: "color", description: "Filter options" },
  brightness: { name: "brightness", description: "Filter options" },
  red: { name: "red", description: "Filter options" },
  green: { name: "green", description: "Filter options" },
  blue: { name: "blue", description: "Filter options" },
  noise: { name: "noise", description: "Filter options" },
  blocksize: { name: "blocksize", description: "Filter options" },
  mode: { name: "mode", description: "Filter options" },
  alpha: { name: "alpha", description: "Filter options" },
  contrast: { name: "contrast", description: "Filter options" },
  rotation: { name: "Hue", description: "Filter options" },
  saturation: { name: "saturation", description: "Filter options" },
  vibrance: { name: "vibrance", description: "Filter options" },
  exposure: { name: "exposure", description: "Filter options" },
};
