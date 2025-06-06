# 📷 img-toolkit

A library for resizing and editing images.

Demo: https://2yh02.github.io/img-toolkit

🦀 A Rust-based version is currently in development — check it out here: [img-toolkit-rust](https://github.com/2YH02/img-toolkit-rust)

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Functions](#functions)
- [Options](#options)
- [License](#license)
- [Author](#author)

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
resizeImage(file: File, options: ImageResizingOption): Promise<File>
```

Resizes and edits an image file according to the provided options.

### Parameters:

- file (File): The image file to be resized and edited.
- options (ImageResizingOption): The options for resizing and editing.

### Returns:

- Promise<File>: A promise that resolves to the resized and edited image file.

## Options

### The Option interface allows you to specify the following properties:

- width (number | "auto"): The desired width of the resized image. Use "auto" to maintain aspect ratio.
- height (number | "auto"): The desired height of the resized image. Use "auto" to maintain aspect ratio.
- quality (number): The quality of the resized image (0 to 1).
- format ("png" | "webp" | "jpg"): The format of the resized image.
- brightness (number): The brightness adjustment factor (default is 0.4).
- resampling (number): The number of resampling iterations (default is 0).

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Author

Created by 2YH02.
