// @ts-check

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes("showcase"),
    }),
  ],
  site: "https://laborata.md",
  vite: {
    plugins: [tailwindcss()],
  },
});
