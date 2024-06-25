const imagePreviewForm = () => {
  const imageInputEl = document.getElementById(
    "image-input"
  ) as HTMLInputElement;
  const watingTextEl = document.getElementById(
    "wating-text"
  ) as HTMLParagraphElement;
  const imagePreviewtEl = document.getElementById(
    "image-preview"
  ) as HTMLImageElement;

  const handleChnage = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const imageTextEl = document.querySelector(
          ".image-text"
        ) as HTMLParagraphElement;

        if (imageTextEl) {
          imageTextEl.textContent =
            file.name + ` (${Math.ceil(file.size / 1024)} kB)`;
        }
      };

      const imagePathname = new URL(imagePreviewtEl.src).pathname;
      if (!imagePathname || imagePathname === "/") {
        watingTextEl.innerText = "Please press the convert button!";
      } else {
        watingTextEl.style.display = "none";
      }
      reader.readAsDataURL(file);
    }
  };

  if (!imageInputEl) return;

  imageInputEl.addEventListener("change", handleChnage);
};

export default imagePreviewForm;
