# 📷 img-toolkit

A library for resizing and editing images.

Demo: https://2yh02.github.io/img-toolkit

## Table of Contents

- [Features](#Features)
- [Installation](#installation)
- [Usage](#usage)
- [Functions](#functions)
- [Options](#options)
- [Defaults and Input Validation](#defaults-and-input-validation)
- [Error Handling Policy](#error-handling-policy)
- [Quality Behavior](#quality-behavior)
- [Quality Comparison](#quality-comparison)
- [Vite Setup for WASM](#vite-setup-for-wasm)
- [License](#license)
- [Author](#author)

## Features

- ⚡ **Fast & Efficient**: Powered by Rust and WebAssembly.
- 📸 **Supports JPEG, PNG, WebP** formats.
- 📐 **Resizing** with automatic aspect-ratio handling.
- 🎚️ **Adjust brightness** easily.
- 🔍 **Multiple resampling filters** (Nearest, Triangle, CatmullRom, Gaussian, Lanczos3).

## Installation

To install the library, you can use npm or yarn:

```bash
npm install img-toolkit
yarn add img-toolkit
```

## Usage

### New API (recommended)

```javascript
import {
  processImage,
  resize,
  convertFormat,
  adjustBrightness,
} from "img-toolkit";

const resized = await resize(file, { width: 800, resampling: 4 });
const brighter = await adjustBrightness(file, { brightness: 0.6 });
const converted = await convertFormat(file, { format: "webp", quality: 0.8 });

const processed = await processImage(file, {
  width: 800,
  height: 600,
  quality: 0.8,
  format: "jpg",
  brightness: 0.5,
  resampling: 2,
});
```

### Legacy API (deprecated in 2.x)

```javascript
import { resizeImage } from "img-toolkit";

const file = // your image file
const output = await resizeImage(file, {
  width: 800,
  height: 600,
  quality: 0.8,
  format: "jpg",
  brightness: 0.5,
  resampling: 2,
});
```

`resizeImage(file, options)` is still supported in `2.x` and will be removed in `3.0.0`.

## Functions

```javascript
processImage(file: File, options: ProcessImageOptions): Promise<File>
resize(file: File, options: ResizeOnlyOptions): Promise<File>
convertFormat(file: File, options: ConvertFormatOptions): Promise<File>
adjustBrightness(file: File, options: BrightnessOptions): Promise<File>
```

## Options

### `ProcessImageOptions`

| Option       | Type   | Description                                                                                       |
| ------------ | ------ | ------------------------------------------------------------------------------------------------- |
| `width`      | number | (Optional) Target width in pixels. If omitted, width is auto-adjusted.                           |
| `height`     | number | (Optional) Target height in pixels. If omitted, height is auto-adjusted.                         |
| `quality`    | number | (Optional) 0.0 to 1.0. Effective for JPEG and WebP output. Defaults to `0.7`. Non-finite values (e.g. `NaN`) are sanitized to the default. |
| `format`     | string | Output format (`"jpg"`, `"png"`, `"webp"`).                                                      |
| `brightness` | number | (Optional) 0.0 to 1.0. Defaults to 0.5.                                                           |
| `resampling` | number | (Optional) 0 to 10. Defaults to 4.                                                                |

### `ResizeOnlyOptions`

| Option       | Type   | Description                                            |
| ------------ | ------ | ------------------------------------------------------ |
| `width`      | number | (Optional) Target width in pixels.                     |
| `height`     | number | (Optional) Target height in pixels.                    |
| `resampling` | number | (Optional) 0 to 10. Defaults to 4.                     |
| `quality`    | number | (Optional) 0.0 to 1.0. Effective if source is JPEG. Defaults to `0.7`. Non-finite values are sanitized to the default. |

### `ConvertFormatOptions`

| Option    | Type   | Description                                            |
| --------- | ------ | ------------------------------------------------------ |
| `format`  | string | Output format (`"jpg"`, `"png"`, `"webp"`).           |
| `quality` | number | (Optional) 0.0 to 1.0. Effective for JPEG and WebP output. Defaults to `0.7`. Non-finite values are sanitized to the default. |

### `BrightnessOptions`

| Option       | Type   | Description                                         |
| ------------ | ------ | --------------------------------------------------- |
| `brightness` | number | 0.0 to 1.0. Defaults to `0.5`. Non-finite values are sanitized to the default. |
| `quality`    | number | (Optional) 0.0 to 1.0. Effective if source is JPEG. |

## Defaults and Input Validation

- `quality` defaults to `0.7` when omitted.
- `brightness` defaults to `0.5` when omitted.
- `resampling` defaults to `4` when omitted.
- `quality` and `brightness` are clamped to valid ranges (`0.0..1.0`), and non-finite values such as `NaN` / `Infinity` are sanitized to safe defaults.
- `resampling` is clamped to `0..10`, and non-finite values are sanitized to default.

## Error Handling Policy

- User-facing errors are intentionally generic and safe for client contexts.
- Internal low-level encoder/decoder details are logged internally and are not returned directly to API consumers.
- Typical user-facing messages include:
  - `Invalid options`
  - `Unsupported format`
  - `Image processing failed`

## Quality Behavior

- `jpg` output: `quality` is applied.
- `png` output: `quality` is not applied (lossless PNG encoding).
- `webp` output: `quality` is applied through the browser's native lossy WebP encoder.

## Quality Comparison

Below is a simple visual/file-size comparison using the same source image.

| Variant | Size |
| --- | --- |
| Original | 747 KB |
| JavaScript Canvas API output | 49.3 KB |
| Rust/WASM output (`img-toolkit`) | 41.3 KB |

### Original

![Original wolf image](./docs/assets/quality/wolf.jpg)

### JavaScript Canvas API output

![Canvas API output](./docs/assets/quality/wolf.js.jpg)

### Rust/WASM output

![Rust WASM output](./docs/assets/quality/wolf.rust.jpg)

## Vite Setup for WASM

To use img-toolkit with Vite, you must disable pre-optimization for the package to prevent WebAssembly loading issues:

### vite.config.js

```javascript
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: ["img-toolkit"],
  },
});
```

Without this setting, Vite may attempt to pre-bundle img-toolkit and break WASM module resolution.
This ensures that WebAssembly is loaded correctly at runtime via dynamic import().

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Author

Created by 2YH02.
