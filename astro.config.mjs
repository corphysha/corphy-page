// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://corphysha.github.io",
  base: "/corphy-page",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  // Enable View Transitions for smooth page navigation
  prefetch: true,
  devToolbar: {
    enabled: false,
  },
});
