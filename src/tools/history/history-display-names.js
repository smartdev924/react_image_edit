import { BsEraser, BsCrop as CropIcon } from "react-icons/bs";
import { FaRegImage, FaHome as HomeIcon } from "react-icons/fa";
import { IoColorPaletteOutline, IoTextOutline } from "react-icons/io5";
import { RxShadow } from "react-icons/rx";
import {
  MdDeleteOutline as DeleteIcon,
  MdOutlineHistory as HistoryIcon,
  MdOutlinePhotoLibrary as PhotoLibraryIcon,
  MdOutlinePhotoSizeSelectLarge as PhotoSizeSelectLargeIcon,
  MdOutlineStyle as StyleIcon,
} from "react-icons/md";
// TbColorFilter
import { TbColorFilter as ColorFilterIcon } from "react-icons/tb";
import { ToolName } from "../tool-name";

export const HISTORY_DISPLAY_NAMES = {
  [ToolName.IMAGE]: {
    name: "Added Image",
    icon: FaRegImage,
  },
  [ToolName.TEXT]: {
    name: "Added Text",
    icon: IoTextOutline,
  },
  [ToolName.BACKGROUND]: {
    name: "Changed Background",
    icon: IoColorPaletteOutline,
  },
  [ToolName.ERASER]: {
    name: "Erased",
    icon: BsEraser,
  },
  [ToolName.SHADOW]: {
    name: "Added Shadow",
    icon: RxShadow,
  },
  [ToolName.EFFECTS]: {
    name: "Added Effects",
    icon: ColorFilterIcon,
  },
  bgImage: {
    name: "Replaced Background Image",
    icon: PhotoLibraryIcon,
  },
  overlayImage: {
    name: "Added Image",
    icon: PhotoLibraryIcon,
  },
  initial: { name: "Initial", icon: HomeIcon },
  loadedState: {
    name: "Loaded State",
    icon: HistoryIcon,
  },
  objectStyle: {
    name: "Changed Style",
    icon: StyleIcon,
  },
  deletedObject: {
    name: "Deleted object",
    icon: DeleteIcon,
  },
  replaceImage: {
    name: "Replaced Image",
    icon: HistoryIcon,
  },
  crop: {
    name: "Cropped Image",
    icon: CropIcon,
  },
  resize: {
    name: "Resized Image",
    icon: PhotoSizeSelectLargeIcon,
  },
  mainImage: {
    name: "Main Image",
    icon: PhotoSizeSelectLargeIcon,
  },
};
