import { defineConfig } from "astro/config";
import { SITE_URL } from "./src/site.config.mjs";

export default defineConfig({
  site: SITE_URL,
  // Pages are served as /controls, /trust and so on. A trailing slash works too.
  trailingSlash: "ignore",
});
