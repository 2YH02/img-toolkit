import init, { resize_image } from "../pkg/img_toolkit.js";

export type ResizeOptions = {
  width?: number;
  height?: number;
  quality?: number;
  format: "png" | "jpg" | "webp";
  brightness?: number;
  resampling?: number;
};

export async function resizeImage(
  file: File,
  options: ResizeOptions
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
  const mime =
    options.format === "jpg" ? "image/jpeg" : `image/${options.format}`;

  return new File([result], `resized.${options.format}`, { type: mime });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
