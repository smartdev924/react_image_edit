import packageConfig from "../../package.json";
// MdOutlineHistory as HistoryIcon,
import { MdOutlineHistory as HistoryIcon } from "react-icons/md";
// HiOutlineDownload as FileDownloadIcon,
import { HiOutlineDownload as FileDownloadIcon } from "react-icons/hi";
import { DEFAULT_NAV_ITEMS } from "./default-nav-items";
import { defaultObjectProps } from "./default-object-props";

export const SELLER_IMAGE_VERSION = packageConfig.version;

export const DEFAULT_CONFIG = {
  selector: "seller_image-editor",
  textureSize: 4096,
  ui: {
    visible: true,
    mode: "full",
    forceOverlayModeOnMobile: true,
    allowEditorClose: true,
    menubar: {
      items: [
        {
          type: "undoWidget",
          align: "left",
        },
        {
          type: "redoWidget",
          align: "left",
        },
        {
          type: "zoomIn",
          align: "center",
        },
        {
          type: "zoomOut",
          align: "center",
        },
      ],
    },
    nav: {
      position: "left",
      items: [...DEFAULT_NAV_ITEMS],
    },
    imageOverlay: {
      show: false,
    },
    colorPresets: {
      items: [
        "rgb(0,0,0)",
        "rgb(255, 255, 255)",
        "rgb(242, 38, 19)",
        "rgb(249, 105, 14)",
        "rgb(253, 227, 167)",
        "rgb(4, 147, 114)",
        "rgb(30, 139, 195)",
        "rgb(142, 68, 173)",
        "rgba(255, 255, 255, 0)",
      ],
    },
  },
  objectDefaults: {
    global: {
      ...defaultObjectProps,
    },
    text: {
      textAlign: "initial",
      underline: false,
      linethrough: false,
      fontStyle: "normal",
      fontFamily: "Times New Roman",
      fontWeight: "normal",
      stroke: "#fff",
      fontSize: 40,
    },
  },
  tools: {
    filter: {
      items: [
        "grayscale",
        "blackWhite",
        "sharpen",
        "invert",
        "vintage",
        "polaroid",
        "kodachrome",
        "technicolor",
        "brownie",
        "sepia",
        "removeColor",
        "brightness",
        "gamma",
        "noise",
        "pixelate",
        "blur",
        "emboss",
        "blendColor",
        "contrast",
        "hueRotation",
        "saturation",
        "vibrance",
        "exposure",
      ],
    },
    zoom: {
      allowUserZoom: true,
      fitImageToScreen: true,
    },
    crop: {
      allowCustomRatio: true,
      defaultRatio: "1:1",
    },
    text: {
      defaultText: "Double click to edit",
      fonts: [
        {
          family: "Roboto",
          src: "fonts/open-sans-v27-latin-ext_latin-regular.woff2",
        },
        {
          family: "Fuzzy Bubbles",
          src: "fonts/fuzzy-bubbles-v3-latin-700.woff2",
          descriptors: { weight: "700" },
        },
        {
          family: "Aleo Bold",
          src: "fonts/aleo-v4-latin-ext_latin-700.woff2",
          descriptors: { weight: "700" },
        },
        {
          family: "Amatic SC",
          src: "fonts/amatic-sc-v16-latin-ext_latin-regular.woff2",
        },
        {
          family: "Corinthia Bold",
          src: "fonts/corinthia-v7-latin-ext_latin-700.woff2",
        },
        {
          family: "Bungee Inline",
          src: "fonts/bungee-inline-v6-latin-ext_latin-regular.woff2",
        },
        {
          family: "Robot Slab Bold",
          src: "fonts/roboto-slab-v16-latin-ext_latin-500.woff2",
        },
        {
          family: "Carter One",
          src: "fonts/carter-one-v12-latin-regular.woff2",
        },
        {
          family: "Cody Star",
          src: "fonts/codystar-v10-latin-ext_latin-regular.woff2",
        },
        {
          family: "Fira Sans",
          src: "fonts/fira-sans-v11-latin-ext_latin_cyrillic-regular.woff2",
        },
        {
          family: "Krona One",
          src: "fonts/krona-one-v9-latin-ext_latin-regular.woff2",
        },
        {
          family: "Kumar One Outline",
          src: "fonts/kumar-one-outline-v8-latin-ext_latin-regular.woff2",
        },
        {
          family: "Lobster Two",
          src: "fonts/lobster-two-v13-latin-regular.woff2",
        },
        {
          family: "Molle Italic",
          src: "fonts/molle-v11-latin-ext_latin-italic.woff2",
        },
        {
          family: "Monoton",
          src: "fonts/monoton-v10-latin-regular.woff2",
        },
        {
          family: "Nixie One",
          src: "fonts/nixie-one-v11-latin-regular.woff2",
        },
        {
          family: "Sancreek",
          src: "fonts/sancreek-v13-latin-ext_latin-regular.woff2",
        },
        {
          family: "Stint Ultra Expanded",
          src: "fonts/stint-ultra-expanded-v10-latin-regular.woff2",
        },
        {
          family: "VT323",
          src: "fonts/vt323-v12-latin-ext_latin-regular.woff2",
        },
        {
          family: "Trash Hand",
          src: "fonts/TrashHand.ttf",
        },
        {
          family: "Tangerine",
          src: "fonts/Tangerine-Regular.ttf",
        },
        {
          family: "Macondo",
          src: "fonts/Macondo-Regular.ttf",
        },
        {
          family: "Pacifico",
          src: "fonts/Pacifico-Regular.ttf",
        },
        {
          family: "Press Start 2P",
          src: "fonts/PressStart2P-Regular.ttf",
        },
        {
          family: "Luckiest Guy",
          src: "fonts/LuckiestGuy-Regular.ttf",
        },
        {
          family: "Aladin",
          src: "fonts/Aladin/Aladin-Regular.ttf",
        },
        {
          family: "Chonburi",
          src: "fonts/Chonburi/Chonburi-Regular.ttf",
        },
        {
          family: "Cinzel Decorative",
          src: "fonts/Cinzel_Decorative/CinzelDecorative-Regular.ttf",
        },
        {
          family: "Geostar Fill",
          src: "fonts/Geostar_Fill/GeostarFill-Regular.ttf",
        },
        {
          family: "Gravitas One",
          src: "fonts/Gravitas_One/GravitasOne-Regular.ttf",
        },
        {
          family: "Gugi",
          src: "fonts/Gugi/Gugi-Regular.ttf",
        },
        {
          family: "Jim Nightshade",
          src: "fonts/Jim_Nightshade/JimNightshade-Regular.ttf",
        },
        {
          family: "Oleo Script Swash Caps",
          src: "fonts/Oleo_Script_Swash_Caps/OleoScriptSwashCaps-Regular.ttf",
        },
        {
          family: "Original Surfer",
          src: "fonts/Original_Surfer/OriginalSurfer-Regular.ttf",
        },
        {
          family: "Raleway",
          src: "fonts/Raleway/Raleway-Regular.ttf",
        },
        {
          family: "Revalia",
          src: "fonts/Revalia/Revalia-Regular.ttf",
        },
        {
          family: "Rubik Glitch",
          src: "fonts/Rubik_Glitch/RubikGlitch-Regular.ttf",
        },
        {
          family: "Rubik Puddles",
          src: "fonts/Rubik_Puddles/RubikPuddles-Regular.ttf",
        },
        {
          family: "Rye",
          src: "fonts/Rye/Rye-Regular.ttf",
        },
        {
          family: "Sofia",
          src: "fonts/Sofia/Sofia-Regular.ttf",
        },
        {
          family: "Zen Dots",
          src: "fonts/Zen_Dots/ZenDots-Regular.ttf",
        },
        ...[
          "Alfa Slab One",
          "Architects Daughter",
          "Bebas Neue",
          "Bitter",
          "Caveat",
          "Comfortaa",
          "Coming Soon",
          "Courgette",
          "Dancing Script",
          "DM Serif Display",
          "Fredericka the Great",
          "Fredoka One",
          "Gloria Hallelujah",
          "Great Vibes",
          "Hepta Slab",
          "Homemade Apple",
          "Indie Flower",
          "Kaushan Script",
          "Meie Script",
          "Merienda",
          "Montserrat",
          "Nunito Sans",
          "Open Sans",
          "Oswald",
          "Parisienne",
          "Patrick Hand",
          "Permanent Marker",
          "Playfair Display",
          "Rancho",
          "Roboto Slab",
          "Rock Salt",
          "Satisfy",
          "Shadows Into Light",
          "Short Stack",
          "Sriracha",
          "Tourney",
          "Waiting for the Sunrise",
          "Yellowtail",
        ].map((el) => ({
          family: el,
          src: `fonts/${el.replaceAll(" ", "_")}/${el.replaceAll(
            " ",
            ""
          )}-Regular.ttf`,
        })),
      ],
    },
    import: {
      validImgExtensions: ["png", "jpg", "jpeg", "svg", "gif"],
      fitOverlayToScreen: true,
      openDroppedImageAsBackground: true,
    },
    export: {
      defaultFormat: "png",
      defaultQuality: 0.8,
      defaultName: "image",
    },
  },
};
