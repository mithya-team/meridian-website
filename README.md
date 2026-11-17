# Meridian website

The public website for **Meridian**, MDF operations for channel marketing teams. It is written for the people who evaluate it: finance, procurement, internal audit, IT security, and the channel marketing leader who champions it.

Built with [Astro](https://astro.build). Every page is plain HTML and CSS with a small script for its interactions (tabs, accordions, motion). Visitors don't download a framework.

## Run it

Needs Node 22 or later.

```bash
npm install
npm run dev        # http://localhost:4321, reloads as you edit
npm run check      # builds the site, then checks every link between pages and every #section it points at
npm run build      # the finished site, in dist/
```

## Pages

| Address | Page | Files |
|---|---|---|
| `/` | Home | `src/pages/index.astro`, `src/scripts/home.js` |
| `/how-it-works` | How it works | `how-it-works.astro`, `styles/how.css`, `scripts/how.js` |
| `/controls` | Controls | `controls.astro`, `styles/controls.css`, `scripts/controls.js` |
| `/audit-evidence-pack` | Audit evidence pack | `audit-evidence-pack.astro`, `styles/evidence.css`, `scripts/evidence.js` |
| `/teams` | Teams | `teams.astro`, `styles/teams.css`, `scripts/teams.js` |
| `/for-partners` | For partners | `for-partners.astro`, `styles/partners.css`, `scripts/partners.js` |
| `/questions` | Questions | `questions.astro`, `styles/questions.css`, `scripts/questions.js` |
| `/trust` | Trust | `trust.astro`, `styles/trust.css`, `scripts/trust.js` |

## How it fits together

- `src/layouts/Base.astro`: the head of every page (title, description, icons, share tags), the skip link, the nav and the footer.
- `src/components/`: `Nav.astro`, `Footer.astro` and `Logo.astro`, shared by every page.
- `src/styles/site.css`: the design system (colours, type, cards, chips, buttons, the accordion) and the homepage's sections. Every page imports it first, then its own stylesheet.
- `src/scripts/`: one script per page. Each checks whether the visitor prefers reduced motion and leaves the page fully readable without it.
- `public/`: icons, the web manifest, the share images (`og-*.png`, 1200 × 630) and `robots.txt`.
- `src/site.config.mjs`: the live address and the launch switch (see below).

Short class names in `site.css` are already taken (`.t`, `.in`, `.sheet`, `.stage`, `.rail`, `.note`, `.plus`), so page stylesheets use a prefix for their own: `k` (Controls), `fp` (For partners), `q` (Questions), `t` (Teams), `tr` (Trust), `w` (How it works), `c`.

Links between pages use the page's address (`/controls#c-08`, `/teams#role-claims`). Pages with accordions open the right section when the address names one.

## What the copy must keep to

- The product is **Meridian**. Not "Venzi Meridian".
- Say **marketing**, never "field marketing".
- Connections to sign-in, document storage, e-signature, CRM and budget planning are **Planned**, not built. Label them that way.
- Don't claim a certification (SOC 2, ISO 27001). Those answers are still "To confirm" on the Trust page.
- Prices, and any prospect's name or tools, stay off the site.
- Example people, companies and amounts are fictional.

## Before launch

- [ ] Choose the domain and set `SITE_URL` in `src/site.config.mjs` (share images need it).
- [ ] Set `LIVE = true` there, and allow crawlers in `public/robots.txt`.
- [ ] Make "Request a walkthrough" send somewhere: today it only scrolls to the closing section.
- [ ] Replace the footer's placeholder links (About, Contact, Privacy, Terms, Roadmap).
- [ ] Answer the Trust page's "To confirm" topics.
