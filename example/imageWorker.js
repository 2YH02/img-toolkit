import {
  adjustBrightness,
  convertFormat,
  processImage,
  resize,
} from "../dist/resizeImage.js";

self.onmessage = async (event) => {
  const { id, mode, file, options } = event.data;

  try {
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
