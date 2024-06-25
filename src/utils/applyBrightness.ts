const applyBrightness = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  sharpness: number
) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const len = data.length;
  const factor = sharpness * 2.5;

  for (let i = 0; i < len; i += 4) {
    data[i] = Math.min(255, data[i] * factor);
    data[i + 1] = Math.min(255, data[i + 1] * factor);
    data[i + 2] = Math.min(255, data[i + 2] * factor);
  }

  ctx.putImageData(imageData, 0, 0);
};

export default applyBrightness;
