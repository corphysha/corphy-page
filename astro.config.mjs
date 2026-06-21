// @ts-check

import mdx from "@astrojs/mdx";
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
  ],
  // Markdown & syntax highlighting
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
  // Enable View Transitions for smooth page navigation
  prefetch: true,
  devToolbar: {
    enabled: false,
  },
});
