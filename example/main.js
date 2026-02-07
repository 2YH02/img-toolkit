const fileInput = document.getElementById("image-input");
const convertBtn = document.getElementById("convert-button");
const previewImg = document.getElementById("image-preview");
const previewContainer = document.getElementById("preview-container");
const downloadButton = document.getElementById("download-button");
const waitingText = document.getElementById("waiting-text");
const formatSizeEl = document.getElementById("format-image-size");
const statusText = document.getElementById("status-text");
const errorText = document.getElementById("error-text");
const modeHelp = document.getElementById("mode-help");
const qualityHelp = document.getElementById("quality-help");
const operationInput = document.getElementById("operation-input");

const qualityInput = document.getElementById("quality-input");
const brightnessInput = document.getElementById("brightness-input");
const widthInput = document.getElementById("width-input");
const heightInput = document.getElementById("height-input");
const resampleInput = document.getElementById("resample-input");
const formatSelect = document.getElementById("format-input");
const formatRow = document.getElementById("format-row");
const qualityWrap = document.getElementById("quality-wrap");
const brightnessWrap = document.getElementById("brightness-wrap");
const widthWrap = document.getElementById("width-wrap");
const heightWrap = document.getElementById("height-wrap");
const resampleWrap = document.getElementById("resample-wrap");

let selectedFile = null;
let objectUrl = null;
let reqId = 0;
const WORKER_RESPONSE_TIMEOUT_MS = 15000;
const worker = new Worker(new URL("./imageWorker.js", import.meta.url), {
  type: "module",
});
const pending = new Map();

worker.onmessage = (event) => {
  const { id, ok, output, error } = event.data;
  const resolver = pending.get(id);
  if (!resolver) return;
  pending.delete(id);
  clearTimeout(resolver.timeoutId);
  if (ok) {
    resolver.resolve(output);
  } else {
    resolver.reject(new Error(error));
  }
};
worker.onerror = (event) => {
  console.error("Worker error:", event.message);
  rejectAllPending(new Error("Worker failed to initialize."));
};
worker.onmessageerror = () => {
  rejectAllPending(new Error("Worker response parsing failed."));
};

fileInput.addEventListener("change", (e) => {
  const imageName = document.getElementById("image-name");
  const imageSize = document.getElementById("image-size");
  selectedFile = e.target.files[0] || null;

  if (selectedFile && imageName && imageSize) {
    const size = formatBytes(selectedFile.size);
    imageSize.textContent = size;
    imageName.textContent = selectedFile.name;
  }

  syncUiByMode();
});

operationInput.addEventListener("change", syncUiByMode);
formatSelect.addEventListener("change", syncQualityHelp);

convertBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  try {
    const mode = operationInput.value;
    const output = await runOperationInWorker(mode, selectedFile);
    const size = formatBytes(output.size);
    const ext = extensionFromFile(output);

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(output);
    previewImg.src = objectUrl;

    formatSizeEl.textContent = `Output size: ${size}`;
    statusText.textContent = `Completed with ${mode}`;
    errorText.textContent = "";
    previewContainer.style.display = "block";
    waitingText.style.display = "none";

    downloadButton.style.display = "block";
    downloadButton.href = objectUrl;
    downloadButton.download = selectedFile.name.replace(/\.[^/.]+$/, `.${ext}`);
  } catch (error) {
    errorText.textContent = `Failed: ${String(error.message || error)}`;
    statusText.textContent = "";
  }
});

function syncUiByMode() {
  const mode = operationInput.value;

  setVisible(formatRow, mode === "process" || mode === "convert");
  setVisible(widthWrap, mode === "process" || mode === "resize");
  setVisible(heightWrap, mode === "process" || mode === "resize");
  setVisible(resampleWrap, mode === "process" || mode === "resize");
  setVisible(brightnessWrap, mode === "process" || mode === "brightness");
  setVisible(qualityWrap, true);

  if (mode === "process") {
    modeHelp.textContent = "processImage: resize + convert + brightness in one call.";
  } else if (mode === "resize") {
    modeHelp.textContent = "resize: keep source format and resize only.";
  } else if (mode === "convert") {
    modeHelp.textContent = "convertFormat: only change output format.";
  } else {
    modeHelp.textContent = "adjustBrightness: brightness only, keeps source format.";
  }

  syncQualityHelp();
}

function syncQualityHelp() {
  const mode = operationInput.value;
  const target = formatSelect.value;
  const source = selectedFile?.type?.toLowerCase() || "";

  const qualityEffective =
    (mode === "process" || mode === "convert") &&
    (target === "jpg" || target === "webp")
      ? true
      : (mode === "resize" || mode === "brightness") &&
        source.includes("jpeg");

  qualityHelp.textContent = qualityEffective
    ? "quality is currently effective."
    : "quality has effect for JPEG/WebP output, or JPEG source in resize/brightness mode.";
}

async function runOperationInWorker(mode, file) {
  const format = formatSelect.value;
  const quality = asNumber(qualityInput.value);
  const brightness = asNumber(brightnessInput.value);
  const width = positiveOrUndefined(widthInput.value);
  const height = positiveOrUndefined(heightInput.value);
  const resampling = asNumber(resampleInput.value);

  let options;
  if (mode === "process") {
    options = {
      width,
      height,
      quality,
      format,
      brightness,
      resampling,
    };
  } else if (mode === "resize") {
    options = {
      width,
      height,
      quality,
      resampling,
    };
  } else if (mode === "convert") {
    options = {
      format,
      quality,
    };
  } else {
    options = {
      brightness,
      quality,
    };
  }

  const id = ++reqId;
  const result = new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      pending.delete(id);
      reject(new Error("Worker response timed out."));
    }, WORKER_RESPONSE_TIMEOUT_MS);
    pending.set(id, { resolve, reject, timeoutId });
  });
  try {
    worker.postMessage({ id, mode, file, options });
  } catch (error) {
    const resolver = pending.get(id);
    if (resolver) {
      clearTimeout(resolver.timeoutId);
      pending.delete(id);
      resolver.reject(error instanceof Error ? error : new Error(String(error)));
    }
  }
  return result;
}

function rejectAllPending(error) {
  for (const [id, resolver] of pending.entries()) {
    clearTimeout(resolver.timeoutId);
    resolver.reject(error);
    pending.delete(id);
  }
}

function extensionFromFile(file) {
  if (file.type.includes("png")) return "png";
  if (file.type.includes("webp")) return "webp";
  return "jpg";
}

function setVisible(element, visible) {
  if (!visible) {
    element.style.display = "none";
    return;
  }

  element.style.display = element.classList.contains("option-container")
    ? "grid"
    : "flex";
}

function asNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function positiveOrUndefined(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return parsed;
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = Math.max(decimals, 0);
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(dm)} ${sizes[i]}`;
}

syncUiByMode();
