// @ts-check

import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://corphysha.github.io",
  base: "/corphy-page",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  // Integrations
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/draft/"),
    }),
    mdx(),
    react(),
  ],
  // Markdown & syntax highlighting
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "github-dark-high-contrast",
      wrap: true,
    },
  },
  // Enable View Transitions for smooth page navigation
  prefetch: true,
  devToolbar: {
    enabled: false,
  },
});
