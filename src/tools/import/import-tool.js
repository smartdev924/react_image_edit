import { toast } from "react-hot-toast";
import { ObjectName } from "../../objects/object-name";
import { state, tools } from "../../state/utils";
import { addImage } from "../canvas/add-image";
import { fetchStateJsonFromUrl } from "./fetch-state-json-from-url";
import { ImportToolValidator } from "./import-tool-validator";

export function createUploadInput(config = {}) {
  const old = document.querySelector("#hidden-file-upload-input");
  if (old) old.remove();

  const input = document.createElement("input");
  input.type = "file";
  input.multiple = config.multiple ?? false;
  input.classList.add("hidden");
  input.style.display = "none";
  input.style.visibility = "hidden";
  input.id = "hidden-file-upload-input";
  // @ts-ignore
  input.accept = buildUploadInputAccept(config);

  if (config.directory) {
    input.webkitdirectory = true;
  }

  document.body.appendChild(input);

  return input;
}

export function openUploadWindow(config = {}) {
  return new Promise((resolve) => {
    const input = createUploadInput(config);

    input.onchange = (e) => {
      // @ts-ignore
      const fileList = e.target.files;
      if (!fileList) {
        return resolve([]);
      }

      const uploads = Array.from(fileList).map(
        (file) => new UploadedFile(file)
      );
      resolve(uploads);
      input.remove();
    };

    document.body.appendChild(input);
    input.click();
  });
}

export function resetEditor(config) {
  // reset UI
  tools().canvas.clear();

  // remove previous image and canvas size
  state().setConfig({
    image: undefined,
    blankCanvasSize: undefined,
    ...config,
  });

  state().reset();

  return new Promise((resolve) => setTimeout(resolve));
}

export const UploadInputType = {
  image: "image/*",
  audio: "audio/*",
  json: "application/json",
  video: "video/mp4,video/mpeg,video/x-m4v,video/*",
};

export function buildUploadInputAccept({ extensions = {}, types = [] }) {
  const accept = [];
  if (extensions) {
    return extensions;
  }

  if (types) {
    accept.push(types.join(","));
  }

  return accept.join(",");
}

export function extensionFromFilename(fullFileName) {
  const re = /(?:\.([^.]+))?$/;
  return re.exec(fullFileName)?.[1];
}

export function getFileMime(file) {
  const extensionsToMime = {
    md: "text/markdown",
    markdown: "text/markdown",
    mp4: "video/mp4",
    mp3: "audio/mp3",
    svg: "image/svg+xml",
    jpg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    yaml: "text/yaml",
    yml: "text/yaml",
  };

  const fileExtension = file.name ? extensionFromFilename(file.name) : null;

  // check if mime type is set in the file object
  if (file.type) {
    return file.type;
  }

  // see if we can map extension to a mime type
  if (fileExtension && fileExtension in extensionsToMime) {
    return extensionsToMime[fileExtension];
  }

  return null;
}

export class UploadedFile {
  name;
  relativePath;
  size;
  mime;
  extension;
  native;
  lastModified;
  url = null;

  cachedData;
  get data() {
    return new Promise((resolve) => {
      if (this.cachedData) {
        resolve(this.cachedData);
      }
      const reader = new FileReader();

      reader.addEventListener("load", () => {
        this.cachedData = reader.result;
        resolve(this.cachedData);
      });

      if (this.extension === "json") {
        reader.readAsText(this.native);
      } else {
        reader.readAsDataURL(this.native);
      }
    });
  }

  constructor(file, relativePath) {
    this.name = file.name;
    this.size = file.size;
    this.mime = getFileMime(file);
    this.lastModified = file.lastModified;
    this.extension = extensionFromFilename(file.name);
    this.native = file;
    relativePath = relativePath || file.webkitRelativePath || null;
    // only include relative path if file is actually in a folder and not just /file.txt
    if (relativePath && relativePath.match(/\//g).length > 1) {
      this.relativePath = relativePath;
    }
  }
}

export class ImportTool {
  validator = new ImportToolValidator();

  /**
   * Open file upload window and add selected image to canvas.
   */
  async uploadAndAddImage() {
    const file = await this.openUploadWindow();
    await this.openUploadedFile(file);
  }

  /**
   * Open file upload window and replace canvas contents with selected image.
   */
  async uploadAndReplaceMainImage() {
    const file = await this.openUploadWindow();
    if (file) {
      await this.openBackgroundImage(file);
      state().togglePanel("newImage", false);
    }
  }

  /**
   * Open file upload window and replace canvas contents with selected state file.
   */
  async uploadAndOpenStateFile() {
    const file = await this.openUploadWindow(stateContentType);
    if (file) {
      await this.loadState(await file.data);
    }
  }

  /**
   * @hidden
   */
  async openUploadedFile(file) {
    if (!file) return;
    const fileData = await file.data;
    switch (file.extension) {
      case "json":
        await this.loadState(fileData);
        break;
      default:
        await addImage(fileData, true, ObjectName.MainImage);
        tools().history.addHistoryItem({ name: "overlayImage" });
    }
  }

  /**
   * Replace current editor state with specified one.
   */
  async loadState(data) {
    state().toggleLoading("state");
    if (!state().replaced) {
      await resetEditor();
    }

    let stateObj;

    if (typeof data === "string") {
      if (data.endsWith(".json")) {
        stateObj = await fetchStateJsonFromUrl(data);
      } else {
        stateObj = JSON.parse(data);
      }
    } else {
      stateObj = data;
    }

    tools().history.addInitial(stateObj);
    await tools().history.reload();
    state().toggleLoading(false);
  }

  /**
   * @hidden
   */
  async openUploadWindow(contentTypes) {
    contentTypes = contentTypes || imgContentTypes();
    const file = (await openUploadWindow(contentTypes))[0];
    if (this.fileIsValid(file)) {
      state().config.onFileOpen?.(file);
      return file;
    }
    return null;
  }

  /**
   * Open specified data or image as background image.
   */
  async openBackgroundImage(image, initial = true) {
    console.log("openBackgroundImage", image);
    const replace = state().replaced;
    if (!replace || !initial) {
      await resetEditor();
    }
    let src;
    if (image instanceof HTMLImageElement) {
      src = image.src;
    } else if (image instanceof UploadedFile) {
      src = await image.data;
    } else if (typeof image === "string") {
      src = image;
    } else {
      src = image;
    }
    let response;
    if (src.startsWith("data:image")) {
      const id = await state().setEraserMask(src.split(",")[1]);
      return id;
    } else {
      response = await tools().canvas.addMainImage(src);
    }
    if (!replace) {
      tools().history.addInitial();
    }
    console.log("response", response);
    return response;
  }

  fileIsValid(file) {
    return !this.validator.validate(file).failed;
  }
}

export function imgContentTypes() {
  const validExtensions = state().config.tools?.import?.validImgExtensions;
  if (validExtensions) {
    return {
      extensions: {
        [UploadInputType.image]: validExtensions.map((el) => `.${el}`),
      },
      types: [],
    };
  }
}

export const stateContentType = {
  extensions: {
    [UploadInputType.json]: [".json"],
  },
  types: [],
};
