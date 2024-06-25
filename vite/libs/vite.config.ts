import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "../../src/index.ts"),
      name: "image-toolkit",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      output: [
        {
          format: "es",
          dir: "dist/esm",
          entryFileNames: "[name].js",
        },
        {
          format: "cjs",
          dir: "dist/cjs",
          entryFileNames: "[name].cjs",
        },
      ],
    },
  },
});
