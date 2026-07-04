import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { fileURLToPath } from "node:url";

const astroPrerenderEntry = fileURLToPath(
  import.meta.resolve("astro/entrypoints/prerender"),
);

export default defineConfig({
  output: "static",
  site: "https://schools.acecore.net",
  integrations: [
    sitemap({
      filter(page) {
        return new URL(page).pathname !== "/404";
      },
      serialize(item) {
        if (item.url === "https://schools.acecore.net/") {
          item.changefreq = "weekly";
          item.priority = 1.0;
        } else {
          item.changefreq = "monthly";
          item.priority = 0.6;
        }
        return item;
      },
    }),
  ],
  vite: {
    resolve: {
      alias: {
        "astro/entrypoints/prerender": astroPrerenderEntry,
      },
    },
  },
});
