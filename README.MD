# 📷 img-toolkit

A library for resizing and editing images.

Demo: https://2yh02.github.io/img-toolkit

## Table of Contents

- [Features](#Features)
- [Installation](#installation)
- [Usage](#usage)
- [Functions](#functions)
- [ResizeOptions](#ResizeOptions)
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

Here's a basic example of how to use the img-toolkit library:

```javascript
import { resizeImage } from 'img-toolkit';

const file = // your image file
const options = {
  width: 800,
  height: 600,
  quality: 0.8,
  format: 'jpg',
  brightness: 0.5,
  resampling: 2
};

resizeImage(file, options).then((resizedFile) => {
  console.log(resizedFile);
}).catch((error) => {
  console.error(error);
});
```

## Functions

```javascript
resizeImage(file: File, options: ResizeOptions): Promise<File>
```

Resizes and edits an image file according to the provided options.

### Parameters:

- file (File): The image file to be resized and edited.
- options (ResizeOptions): The options for resizing and editing.

### Returns:

- Promise<File>: A promise that resolves to the resized and edited image file.

## ResizeOptions

| Option       | Type   | Description                                                                                       |
| ------------ | ------ | ------------------------------------------------------------------------------------------------- |
| `width`      | number | (Optional) Target width in pixels. If omitted, width is auto-adjusted.                            |
| `height`     | number | (Optional) Target height in pixels. If omitted, height is auto-adjusted.                          |
| `quality`    | number | Image quality level ranging from 0.0 (lowest) to 1.0 (highest quality).                           |
| `format`     | string | Output format (`"jpg"`, `"png"`, `"webp"`).                                                       |
| `brightness` | number | (Optional) Brightness level from 0.0 (darkest) to 1.0 (brightest). Defaults to 0.5 if omitted.    |
| `resampling` | number | (Optional) Resampling quality from 0 (fastest) to 10 (highest quality). Defaults to 4 if omitted. |

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
