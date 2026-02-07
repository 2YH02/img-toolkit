import init, { resize_image } from "../pkg/img_toolkit.js";

export type ImageFormat = "png" | "jpg" | "webp";

export type ProcessImageOptions = {
  width?: number;
  height?: number;
  quality?: number;
  format: ImageFormat;
  brightness?: number;
  resampling?: number;
};

export type ResizeOnlyOptions = {
  width?: number;
  height?: number;
  resampling?: number;
  quality?: number;
};

export type ConvertFormatOptions = {
  format: ImageFormat;
  quality?: number;
};

export type BrightnessOptions = {
  brightness: number;
  quality?: number;
};

/**
 * @deprecated Use `ProcessImageOptions`.
 */
export type ResizeOptions = ProcessImageOptions;

let hasWarnedDeprecatedResizeImage = false;

export async function processImage(
  file: File,
  options: ProcessImageOptions
): Promise<File> {
  return processWithWasm(file, options);
}

export async function resize(
  file: File,
  options: ResizeOnlyOptions
): Promise<File> {
  return processWithWasm(file, {
    format: inferFormatFromFile(file),
    width: options.width,
    height: options.height,
    resampling: options.resampling,
    quality: options.quality,
  });
}

export async function convertFormat(
  file: File,
  options: ConvertFormatOptions
): Promise<File> {
  return processWithWasm(file, {
    format: options.format,
    quality: options.quality,
  });
}

export async function adjustBrightness(
  file: File,
  options: BrightnessOptions
): Promise<File> {
  return processWithWasm(file, {
    format: inferFormatFromFile(file),
    brightness: options.brightness,
    quality: options.quality,
  });
}

/**
 * @deprecated Use `processImage`, `resize`, `convertFormat`, or `adjustBrightness`.
 */
export async function resizeImage(
  file: File,
  options: ResizeOptions
): Promise<File> {
  if (!hasWarnedDeprecatedResizeImage) {
    hasWarnedDeprecatedResizeImage = true;
    console.warn(
      "[img-toolkit] resizeImage(file, options) is deprecated. Use processImage/resize/convertFormat/adjustBrightness."
    );
  }

  return processWithWasm(file, options);
}

async function processWithWasm(
  file: File,
  options: ProcessImageOptions
): Promise<File> {
  await init();

  const sanitizedOptions = {
    ...options,
    quality: clamp(options.quality ?? 0.7, 0, 1),
    brightness: clamp(options.brightness ?? 0.5, 0, 1),
    resampling: clamp(options.resampling ?? 4, 0, 10),
  };

  const buffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(buffer);

  const result = resize_image(uint8, sanitizedOptions);
  const output = new Uint8Array(result);
  const mime =
    options.format === "jpg" ? "image/jpeg" : `image/${options.format}`;

  return new File([output], `resized.${options.format}`, { type: mime });
}

function inferFormatFromFile(file: File): ImageFormat {
  const lower = file.type.toLowerCase();
  if (lower === "image/png") return "png";
  if (lower === "image/webp") return "webp";
  return "jpg";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
