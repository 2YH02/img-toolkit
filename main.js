import { resizeImage } from "https://cdn.jsdelivr.net/npm/img-toolkit@2.0.2/dist/resizeImage.min.js";

const fileInput = document.getElementById("image-input");
const convertBtn = document.getElementById("convert-button");
const previewImg = document.getElementById("image-preview");
const previewContainer = document.getElementById("preview-container");
const downloadButton = document.getElementById("download-button");
const watingText = document.getElementById("wating-text");
const formatSizeEl = document.getElementById("format-image-size");

const qualityInput = document.getElementById("quality-input");
const brightnessInput = document.getElementById("brightness-input");
const widthInput = document.getElementById("width-input");
const heightInput = document.getElementById("height-input");
const resampleInput = document.getElementById("resample-input");
const formatSelect = document.getElementById("format-input");

let selectedFile = null;

fileInput.addEventListener("change", (e) => {
  const imageName = document.getElementById("image-name");
  const imageSize = document.getElementById("image-size");
  selectedFile = e.target.files[0] || null;

  if (selectedFile && imageName && imageSize) {
    const size = formatBytes(selectedFile.size);
    imageSize.textContent = size;
    imageName.textContent = selectedFile.name;
  }
});

convertBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  const options = {
    width: Number(widthInput.value),
    height: Number(heightInput.value),
    quality: Number(qualityInput.value),
    format: formatSelect.value,
    brightness: Number(brightnessInput.value),
    resampling: Number(resampleInput.value),
  };

  const newFile = await resizeImage(selectedFile, options);

  const size = formatBytes(newFile.size);

  const objectUrl = URL.createObjectURL(newFile);
  previewImg.src = objectUrl;

  formatSizeEl.textContent = size;
  previewContainer.style.display = "block";
  watingText.style.display = "none";

  downloadButton.style.display = "block";
  downloadButton.href = objectUrl;
  downloadButton.download =
    selectedFile.name.replace(/\.[^/.]+$/, "") + `.${options.format}`;
});

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = Math.max(decimals, 0);
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(dm)} ${sizes[i]}`;
}
