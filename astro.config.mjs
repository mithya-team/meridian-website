import { defineConfig } from "astro/config";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_URL, BASE_PATH, LIVE } from "./src/site.config.mjs";

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

// robots.txt and sitemap.xml follow LIVE in src/site.config.mjs, so launching is one switch.
// In review: robots.txt keeps crawlers out and there is no sitemap. Live: crawlers are allowed and
// sitemap.xml lists every page (not the 404) at SITE_URL.
const crawling = {
  name: "robots-and-sitemap",
  hooks: {
    "astro:build:done": ({ dir }) => {
      const root = fileURLToPath(dir);
      const sitemap = SITE_URL + "/sitemap.xml";
      writeFileSync(join(root, "robots.txt"), LIVE
        ? `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`
        : "# In review: crawlers stay out until LIVE is true in src/site.config.mjs.\nUser-agent: *\nDisallow: /\n");
      if (!LIVE) return;
      const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
      const urls = walk(root)
        .filter((f) => f.endsWith(`${sep}index.html`))
        .map((f) => relative(root, f).split(sep).slice(0, -1).join("/"))
        .sort()
        .map((p) => `  <url><loc>${SITE_URL}/${p ? p + "/" : ""}</loc></url>`);
      writeFileSync(join(root, "sitemap.xml"),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);
    },
  },
};

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  // Pages are served as /controls, /trust and so on. A trailing slash works too.
  trailingSlash: "ignore",
  integrations: [prefixLinks, crawling],
});
