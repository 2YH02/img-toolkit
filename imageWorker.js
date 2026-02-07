const CDN_VERSION = "2.1.0";
let toolkitPromise;

function getToolkit() {
  if (!toolkitPromise) {
    const isGithubPages = self.location.hostname.endsWith("github.io");
    const moduleUrl = isGithubPages
      ? `https://cdn.jsdelivr.net/npm/img-toolkit@${CDN_VERSION}/dist/resizeImage.js`
      : "../dist/resizeImage.js";
    toolkitPromise = import(moduleUrl);
  }
  return toolkitPromise;
}

self.onmessage = async (event) => {
  const { id, mode, file, options } = event.data;

  try {
    const { adjustBrightness, convertFormat, processImage, resize } =
      await getToolkit();
    let output;
    if (mode === "process") {
      output = await processImage(file, options);
    } else if (mode === "resize") {
      output = await resize(file, options);
    } else if (mode === "convert") {
      output = await convertFormat(file, options);
    } else {
      output = await adjustBrightness(file, options);
    }

    self.postMessage({ id, ok: true, output });
  } catch (error) {
    self.postMessage({
      id,
      ok: false,
      error: String(error?.message || error),
    });
  }
};
