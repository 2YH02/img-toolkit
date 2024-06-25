declare module "img-toolkit" {
  export interface ImageResizingOption {
    width?: number | "auto";
    height?: number | "auto";
    quality: number;
    format: "png" | "webp" | "jpg";
    brightness?: number;
    resampling?: number;
  }

  export const resizeImage: (
    file: File,
    option: ImageResizingOption
  ) => Promise<File>;
}
