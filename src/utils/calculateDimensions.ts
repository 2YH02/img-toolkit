import type { Option } from "../resizer";

const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  options: Option
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;

  let width: number, height: number;

  if (options.width === "auto" && options.height === "auto") {
    width = originalWidth;
    height = originalHeight;
  } else if (options.width === "auto") {
    height = options.height as number;
    width = height * aspectRatio;
  } else if (options.height === "auto") {
    width = options.width as number;
    height = width / aspectRatio;
  } else {
    width = options.width as number;
    height = options.height as number;
  }

  return { width, height };
};

export default calculateDimensions;
