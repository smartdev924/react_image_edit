import deepmerge from "deepmerge";
export function lowerFirst(string) {
  if (!string) return "";
  return string.charAt(0).toLowerCase() + string.slice(1);
}

export function mergeConfig(userConfig, currentConfig) {
  const merged = deepmerge(currentConfig, userConfig);
  return replaceDefaultConfigItems(merged, userConfig);
}

function replaceDefaultConfigItems(config, userConfig) {
  Object.keys(config).forEach((key) => {
    if (key.startsWith("replaceDefault") && config[key]) {
      // "replaceDefaultSamples" => "samples" or just "items"
      const iterablesKey = lowerFirst(
        key.replace("replaceDefault", "") || "items"
      );
      config[iterablesKey] = userConfig ? userConfig[iterablesKey] : [];
      // remove passed in "replaceDefaultItems" option, so
      // it does not cause issues on subsequent config merged
      delete config[key];
    } else if (typeof config[key] === "object" && config[key] !== null) {
      replaceDefaultConfigItems(config[key], userConfig?.[key]);
    }
  });
  return config;
}
