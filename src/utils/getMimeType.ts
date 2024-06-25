const getMimeType = (format: string): string => {
  switch (format) {
    case "webp":
      return "image/webp";
    case "png":
      return "image/png";
    case "jpg":
    default:
      return "image/jpeg";
  }
};

export default getMimeType;
