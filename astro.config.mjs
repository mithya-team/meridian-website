import { defineConfig } from "astro/config";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_URL, BASE_PATH } from "./src/site.config.mjs";

const base = BASE_PATH.replace(/\/$/, "");

// Pages link from the root ("/controls", "/favicon.svg"). When the site sits in a folder
// (GitHub Pages: /meridian-website), put that folder in front of every such link after the build.
// Astro already does this for its own CSS and scripts.
const prefixLinks = {
  name: "prefix-root-links",
  hooks: {
    "astro:build:done": ({ dir }) => {
      if (!base) return;
      const root = fileURLToPath(dir);
      const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
      const own = new RegExp(`(\\s(?:href|src))="/(?!/|${base.slice(1)}/)`, "g");
      for (const file of walk(root).filter((f) => f.endsWith(".html"))) {
        writeFileSync(file, readFileSync(file, "utf8").replace(own, `$1="${base}/`));
      }
    },
  },
};

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  // Pages are served as /controls, /trust and so on. A trailing slash works too.
  trailingSlash: "ignore",
  integrations: [prefixLinks],
});
