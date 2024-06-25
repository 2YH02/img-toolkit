import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: resolve(__dirname, "../../src/example"),
  base: "./",
  server: {
    host: "0.0.0.0",
    port: 3000,
    open: false,
  },
  build: {
    rollupOptions: {
      input: {
        example: resolve(__dirname, "../../src/example/index.html"),
      },
      output: {
        dir: resolve(__dirname, "../../dist/example"),
        format: "es",
      },
    },
    outDir: resolve(__dirname, "../../dist/example"),
  },
  preview: {
    host: "0.0.0.0",
    port: 5123,
  },
});
