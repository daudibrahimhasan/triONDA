import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" keeps asset paths relative so the build works both when opened
// directly and when served from a GitHub Pages sub-path.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
