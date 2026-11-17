// Settings for the whole site.

// The address the site is published at, without a trailing slash. Share images and social links need it.
// The publishing workflow sets it for GitHub Pages; the fallback is a placeholder until the domain is chosen.
export const SITE_URL = (process.env.SITE_URL || "https://meridian.example").replace(/\/$/, "");

// The folder the site sits in at that address: "/" on its own domain, "/meridian-website" on GitHub Pages.
// Links in the pages are written from the root ("/controls"); the build adds this folder in front of them.
export const BASE_PATH = process.env.BASE_PATH || "/";

// false while the site is in review: every page asks search engines not to list it,
// and robots.txt (written by astro.config.mjs) keeps crawlers out. Set to true at launch: that also allows
// crawlers and adds sitemap.xml.
export const LIVE = false;
