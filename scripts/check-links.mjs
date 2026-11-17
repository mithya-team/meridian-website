// After `astro build`: checks that every link between pages leads to a page that exists,
// and that every #anchor it points at is on that page. Run with: npm run check
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const DIST = new URL("../dist/", import.meta.url).pathname;
// The folder the site sits in when published (see src/site.config.mjs). Every link must start with it.
const BASE = (process.env.BASE_PATH || "/").replace(/\/$/, "");

function pages(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return pages(p);
    return name.endsWith(".html") ? [p] : [];
  });
}

function fileFor(path) {
  const clean = path.replace(/\/$/, "");
  for (const f of [join(DIST, clean, "index.html"), join(DIST, clean + ".html"), join(DIST, clean)]) {
    if (existsSync(f) && statSync(f).isFile()) return f;
  }
  return null;
}

const ids = new Map();
const idsOf = (file) => {
  if (!ids.has(file)) ids.set(file, new Set([...readFileSync(file, "utf8").matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return ids.get(file);
};

let checked = 0;
const problems = [];
for (const file of pages(DIST)) {
  const html = readFileSync(file, "utf8");
  for (const [, href] of html.matchAll(/\shref="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|\/\/)/.test(href)) continue;
    const where = relative(DIST, file);
    if (href.startsWith("/") && BASE && !href.startsWith(BASE + "/")) { problems.push(`${where}: ${href} is missing the site's folder ${BASE}`); continue; }
    const local = BASE && href.startsWith(BASE + "/") ? href.slice(BASE.length) : href;
    if (/\.(css|js|png|svg|ico|webmanifest|txt)$/.test(local)) {
      if (local.startsWith("/") && !fileFor(local)) problems.push(`${where}: ${href} is missing`);
      continue;
    }
    checked++;
    const [path, hash] = local.split("#");
    const target = path === "" ? file : fileFor(path);
    if (!target) { problems.push(`${where}: ${href} leads to no page`); continue; }
    if (hash && hash !== "top" && !idsOf(target).has(hash)) problems.push(`${where}: ${href} has no #${hash} on that page`);
  }
}
console.log(`${checked} links checked across ${pages(DIST).length} pages.`);
if (problems.length) {
  console.log(problems.join("\n"));
  process.exit(1);
}
console.log("All links lead somewhere.");
