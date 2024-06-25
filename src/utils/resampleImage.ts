const resampleImage = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  targetWidth: number,
  targetHeight: number,
  iterations: number
) => {
  const widthStep = (canvas.width - targetWidth) / iterations;
  const heightStep = (canvas.height - targetHeight) / iterations;

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  if (!tempCtx) return;

  for (let i = 0; i < iterations; i++) {
    const currentWidth = Math.round(canvas.width - widthStep);
    const currentHeight = Math.round(canvas.height - heightStep);

    tempCanvas.width = currentWidth;
    tempCanvas.height = currentHeight;

    tempCtx.drawImage(
      canvas,
      0,
      0,
      canvas.width,
      canvas.height,
      0,
      0,
      currentWidth,
      currentHeight
    );

    canvas.width = currentWidth;
    canvas.height = currentHeight;

    ctx.clearRect(0, 0, currentWidth, currentHeight);
    ctx.drawImage(tempCanvas, 0, 0, currentWidth, currentHeight);
  }
};

export default resampleImage;
