// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { astroFont } from "astro-font/integration";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  integrations: [astroFont(), icon()],
  vite: {
    plugins: [tailwindcss()],
  },
});
