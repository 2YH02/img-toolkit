import init, { resize_image } from "../pkg/img_toolkit.js";

export type ImageFormat = "png" | "jpg" | "webp";

export type ProcessImageOptions = {
  width?: number;
  height?: number;
  /**
   * 0.0 to 1.0.
   * Effective for JPEG and WebP output.
   */
  quality?: number;
  format: ImageFormat;
  brightness?: number;
  resampling?: number;
};

export type ResizeOnlyOptions = {
  width?: number;
  height?: number;
  resampling?: number;
  /**
   * 0.0 to 1.0. Effective when the source image is JPEG.
   */
  quality?: number;
};

export type ConvertFormatOptions = {
  format: ImageFormat;
  /**
   * 0.0 to 1.0.
   * Effective for JPEG and WebP target.
   */
  quality?: number;
};

export type BrightnessOptions = {
  brightness: number;
  /**
   * 0.0 to 1.0. Effective when the source image is JPEG.
   */
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
  options: ProcessImageOptions
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

  const useWebpLossy = options.format === "webp";
  const wasmFormat = useWebpLossy ? "png" : options.format;

  const sanitizedOptions = {
    ...options,
    format: wasmFormat,
    quality: clamp(options.quality ?? 0.7, 0, 1),
    brightness: clamp(options.brightness ?? 0.5, 0, 1),
    resampling: clamp(options.resampling ?? 4, 0, 10),
  };

  const buffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(buffer);

  const result = resize_image(uint8, sanitizedOptions);
  const output = useWebpLossy
    ? await encodeWebpLossyInBrowser(normalizeBytes(result), sanitizedOptions.quality)
    : normalizeBytes(result);
  const mime = options.format === "jpg" ? "image/jpeg" : `image/${options.format}`;

  return new File([toArrayBuffer(output)], `resized.${options.format}`, {
    type: mime,
  });
}

async function encodeWebpLossyInBrowser(
  input: Uint8Array<ArrayBuffer>,
  quality: number
): Promise<Uint8Array> {
  if (typeof createImageBitmap !== "function") {
    throw new Error("Lossy WebP encoding requires browser image APIs.");
  }

  const blob = new Blob([toArrayBuffer(normalizeBytes(input))], { type: "image/png" });
  const bitmap = await createImageBitmap(blob);
  try {
    if (typeof OffscreenCanvas !== "undefined") {
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to create OffscreenCanvas context.");
      ctx.drawImage(bitmap, 0, 0);
      const webpBlob = await canvas.convertToBlob({
        type: "image/webp",
        quality,
      });
      return blobToUint8Array(webpBlob);
    }

    if (typeof document === "undefined") {
      throw new Error("Lossy WebP encoding requires browser canvas support.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to create canvas context.");
    ctx.drawImage(bitmap, 0, 0);
    const webpBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Failed to encode WebP blob."))),
        "image/webp",
        quality
      );
    });
    return blobToUint8Array(webpBlob);
  } finally {
    bitmap.close();
  }
}

async function blobToUint8Array(blob: Blob): Promise<Uint8Array<ArrayBuffer>> {
  const arr = await blob.arrayBuffer();
  return new Uint8Array(arr);
}

function normalizeBytes(input: Uint8Array): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(input);
}

function toArrayBuffer(input: Uint8Array): ArrayBuffer {
  const normalized = normalizeBytes(input);
  return normalized.buffer;
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
