import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";

const astroPrerenderEntry = fileURLToPath(
  import.meta.resolve("astro/entrypoints/prerender"),
);

export default defineConfig({
  output: "static",
  site: "https://schools.acecore.net",
  vite: {
    resolve: {
      alias: {
        "astro/entrypoints/prerender": astroPrerenderEntry,
      },
    },
  },
});
