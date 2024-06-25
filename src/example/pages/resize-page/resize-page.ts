import "./resize-page.css";
import imagePreviewForm from "./scripts/image-preview-form";
import handleClickTransform from "./scripts/resize-file";

const content = /* html */ `
<h1 class="max-width mx-auto">Image Resize</h1>
<section class="container image-form-wrap">
  <div class="image-form">
    <div class="choose-file">
      <p>File Upload</p>
      <div class="divider"></div>
      <div class="image-input-wrap">
        <label for="image-input" class="button">Select File</label>
        <input type="file" id="image-input" accept="image/*" style="display: none"/>
        <p class="ml-3 image-text"></p>
      </div>
    </div>
    <div class="choose-file">
      <p>option</p>
      <div class="divider"></div>
      <div class="center mb-3">
        <div class="center option-input-wrap mr-3">
          <label for="quality-input">quality</label>
          <input type="number" id="quality-input" min="0.1" max="1" step="0.05" value="0.7"/>
        </div>
        <div class="center option-input-wrap">
          <label for="brightness-input">brightness</label>
          <input type="number" id="brightness-input" min="0.1" max="1" step="0.05" value="0.4"/>
        </div>
      </div>
      <div class="size-input-wrap mb-1">
        <div class="center mr-3 option-input-wrap">
          <label for="width-input">width</label>
          <input type="number" id="width-input" step="10" value="550"/>
        </div>
        <div class="center option-input-wrap">
          <label for="height-input">height</label>
          <input type="number" id="height-input" step="10" value="0"/>
        </div>
      </div>
      <div class="mb-3 color-main font-4">
        If either width or height is set to 0, it will be automatically adjusted to maintain the aspect ratio
      </div>
      <div class="center option-input-wrap mb-3">
        <label for="resample-input">resample</label>
        <input type="number" id="resample-input" min="0" max="10" step="1" value="0"/>
      </div>
      <div class="center option-input-wrap">
        <label for="format-input">format</label>
        <select id="format-input" name="imageFormat">
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
            <option value="webp" selected>WEBP</option>
        </select>
      </div>
    </div>
    <div>
      <button class="button" id="image-transform-button">Convert</button>
    </div>
  </div>
</section>
<section class="container image-preview-wrap">
  <p id="format-image-size" class="mb-3"></p>
  <div id="preview-container">
    <img
      id="image-preview"
      src=""
      alt="Image Preview"
      style="display: none"
    />
  </div>
  <p class="color-main font-6" id="wating-text">Waiting for photo selection...</p>
</section>
`;

const resizePage = {
  content: content,
  scripts: [imagePreviewForm, handleClickTransform],
};

export default resizePage;
