import applyBrightness from "./utils/applyBrightness";
import calculateDimensions from "./utils/calculateDimensions";
import getMimeType from "./utils/getMimeType";
import resampleImage from "./utils/resampleImage";

export interface Option {
  width?: number | "auto";
  height?: number | "auto";
  quality: number;
  format: "png" | "webp" | "jpg";
  brightness?: number;
  resampling?: number;
}

export const resizeImage = async (
  file: File,
  options: Option
): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (options.quality < 0 || options.quality > 1) {
      reject(new Error("Please enter a value between 0 and 1"));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const width = options.width !== undefined ? options.width : "auto";
        const height = options.height !== undefined ? options.height : "auto";

        const { width: calculatedWidth, height: calculatedHeight } =
          calculateDimensions(img.width, img.height, {
            ...options,
            width,
            height,
          });

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);

          const resamplingIterations = options.resampling ?? 0;
          if (resamplingIterations >= 1) {
            resampleImage(
              canvas,
              ctx,
              calculatedWidth,
              calculatedHeight,
              resamplingIterations
            );
          }

          if (
            canvas.width !== calculatedWidth ||
            canvas.height !== calculatedHeight
          ) {
            const finalCanvas = document.createElement("canvas");
            finalCanvas.width = calculatedWidth;
            finalCanvas.height = calculatedHeight;
            const finalCtx = finalCanvas.getContext("2d");

            if (finalCtx) {
              finalCtx.drawImage(
                canvas,
                0,
                0,
                canvas.width,
                canvas.height,
                0,
                0,
                calculatedWidth,
                calculatedHeight
              );
              applyBrightness(
                finalCtx,
                calculatedWidth,
                calculatedHeight,
                options.brightness ?? 0.4
              );

              const mimeType = getMimeType(options.format);

              finalCanvas.toBlob(
                (blob) => {
                  if (blob) {
                    const newFileName =
                      file.name.replace(/\.[^/.]+$/, "") + `.${options.format}`;
                    const compressedFile = new File([blob], newFileName, {
                      type: mimeType,
                      lastModified: Date.now(),
                    });
                    resolve(compressedFile);
                  } else {
                    reject(new Error("Canvas toBlob failed"));
                  }
                },
                mimeType,
                options.quality
              );
            } else {
              reject(new Error("Failed to get 2D context for final canvas"));
            }
          } else {
            applyBrightness(
              ctx,
              calculatedWidth,
              calculatedHeight,
              options.brightness ?? 0.4
            );

            const mimeType = getMimeType(options.format);

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const newFileName =
                    file.name.replace(/\.[^/.]+$/, "") + `.${options.format}`;
                  const compressedFile = new File([blob], newFileName, {
                    type: mimeType,
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                } else {
                  reject(new Error("Canvas toBlob failed"));
                }
              },
              mimeType,
              options.quality
            );
          }
        } else {
          reject(new Error("Failed to get 2D context"));
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
