// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { astroFont } from "astro-font/integration";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://edwrd.dev",
  integrations: [astroFont(), icon(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
