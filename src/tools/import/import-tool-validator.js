import { state } from "../../state/utils";
import { toast } from "react-hot-toast";
export const spaceUnits = ["bytes", "KB", "MB", "GB", "TB", "PB"];

export function prettyBytes(bytes, precision) {
  if (Number.isNaN(parseFloat(String(bytes))) || !Number.isFinite(bytes))
    return null;

  let unitKey = 0;
  while (bytes >= 1024) {
    bytes /= 1024;
    unitKey++;
  }

  let unit = spaceUnits[unitKey];

  if (!precision) {
    precision = getPrecision(unit);
  }

  if (unit === "bytes" && bytes < 2) {
    unit = "byte";
  }

  return `${parseFloat(
    bytes.toFixed(+precision).toString()
  ).toString()} ${unit}`;
}

export class UploadValidation {
  passes(file) {
    // @ts-ignore
    return !this.fails(file);
  }
}

export function convertToBytes(value, unit) {
  if (value == null) return 0;
  switch (unit) {
    case "KB":
      return value * 1024;
    case "MB":
      return value * 1024 ** 2;
    case "GB":
      return value * 1024 ** 3;
    case "TB":
      return value * 1024 ** 4;
    case "PB":
      return value * 1024 ** 5;
    default:
      return value;
  }
}

export class FileSizeValidation extends UploadValidation {
  constructor(params) {
    super();
    this.errorMessage = `Maximum file size is ${prettyBytes(+params.maxSize)}`;
    this.params = params;
  }

  fails(file) {
    return this.params.maxSize < file.size;
  }
}

export class AllowedExtensionsValidation extends UploadValidation {
  constructor(params) {
    super();
    this.params = params;
    this.errorMessage = `Only these file types are allowed: ${this.params.extensions.join(
      ", "
    )}`;
  }

  fails(file) {
    return !this.params.extensions.some((extension) => {
      return extension.toLowerCase() === file.extension?.toLowerCase();
    });
  }
}

function getPrecision(unit) {
  switch (unit) {
    case "MB":
      return 1;
    case "GB":
    case "TB":
    case "PB":
      return 2;
    default:
      return 0;
  }
}

export class ImportToolValidator {
  DEFAULT_MAX_FILE_SIZE_MB = 10;
  showToast = true;
  validations = [];

  validate(file) {
    if (!this.validations.length) {
      this.initValidations();
    }

    const failed = this.validations.find((validation) => {
      return validation.fails(file);
    });
    if (failed && this.showToast && failed.errorMessage) {
      toast.error(failed.errorMessage);
    }

    return {
      failed: !!failed,
      errorMessage: failed ? failed.errorMessage : null,
    };
  }
  initValidations() {
    this.validations.push(
      new FileSizeValidation({ maxSize: this.getMaxFileSize() })
    );

    const allowedExtensions = this.getAllowedExtensions();

    if (allowedExtensions && allowedExtensions.length) {
      this.validations.push(
        new AllowedExtensionsValidation({ extensions: allowedExtensions })
      );
    }
  }

  getMaxFileSize() {
    return (
      state().config.tools?.import?.maxFileSize ??
      convertToBytes(this.DEFAULT_MAX_FILE_SIZE_MB, "MB")
    );
  }

  getAllowedExtensions() {
    const imgExtensions =
      state().config.tools?.import?.validImgExtensions ?? [];
    return [...imgExtensions, "json"];
  }
}
