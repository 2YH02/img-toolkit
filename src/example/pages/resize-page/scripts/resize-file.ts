import { resizeImage } from "../../../../resizer";
import type { Option } from "../../../../resizer";

type ImageType = "jpg" | "png" | "webp";

const handleClickTransform = () => {
  let option: Option = {
    height: "auto",
    width: 550,
    quality: 0.7,
    format: "webp",
    resampling: 0,
    brightness: 0.4,
  };

  const buttonEl = document.getElementById(
    "image-transform-button"
  ) as HTMLButtonElement;
  const imageInput = document.getElementById("image-input") as HTMLInputElement;
  const previewImage = document.getElementById(
    "image-preview"
  ) as HTMLImageElement;

  const qualityInput = document.getElementById(
    "quality-input"
  ) as HTMLInputElement;

  const heightInput = document.getElementById(
    "height-input"
  ) as HTMLInputElement;
  const widthInput = document.getElementById("width-input") as HTMLInputElement;
  const formatInput = document.getElementById(
    "format-input"
  ) as HTMLInputElement;
  const brightnessInput = document.getElementById(
    "brightness-input"
  ) as HTMLInputElement;
  const resampleInput = document.getElementById(
    "resample-input"
  ) as HTMLInputElement;

  qualityInput.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    if (Number(target.value) < 0) {
      option.quality = 0;
      qualityInput.value = "0";
    } else if (Number(target.value) > 1) {
      option.quality = 1;
      qualityInput.value = "1";
    } else {
      option.quality = Number(target.value);
    }
  });
  heightInput.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    if (Number(target.value) <= 0) {
      option.height = "auto";
      heightInput.value = "0";
    } else {
      option.height = Number(target.value);
    }
  });
  widthInput.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    if (Number(target.value) <= 0) {
      option.width = "auto";
      widthInput.value = "0";
    } else {
      option.width = Number(target.value);
    }
  });
  formatInput.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    option.format = target.value as ImageType;
  });
  brightnessInput.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    if (Number(target.value) < 0) {
      option.brightness = 0;
      brightnessInput.value = "0";
    } else if (Number(target.value) > 1) {
      option.brightness = 1;
      brightnessInput.value = "1";
    } else {
      option.brightness = Number(target.value);
    }
  });
  resampleInput.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    if (Number(target.value) < 0) {
      option.resampling = 0;
      resampleInput.value = "0";
    } else if (Number(target.value) > 10) {
      option.resampling = 10;
      resampleInput.value = "10";
    } else {
      option.resampling = Number(target.value);
    }
  });

  buttonEl.addEventListener("click", async () => {
    const files = imageInput.files;
    if (files && files.length > 0) {
      const formatSizeEl = document.getElementById(
        "format-image-size"
      ) as HTMLParagraphElement;
      const imagePreviewtEl = document.getElementById(
        "image-preview"
      ) as HTMLImageElement;
      const watingTextEl = document.getElementById(
        "wating-text"
      ) as HTMLParagraphElement;

      const file = files[0];

      const resizedFile = await resizeImage(file, option);

      if (previewImage) {
        previewImage.style.display = "block";
      }

      const resizedImageURL = URL.createObjectURL(resizedFile);
      previewImage.src = resizedImageURL;

      const imagePathname = new URL(imagePreviewtEl.src).pathname;
      if (!imagePathname || imagePathname === "/") {
        watingTextEl.innerText = "Please press the convert button!";
      } else {
        watingTextEl.style.display = "none";
      }

      formatSizeEl.innerText = `${Math.floor(resizedFile.size / 1024)} kB`;
    } else {
      console.log("No file selected.");
    }
  });
};

export default handleClickTransform;
