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

## Where it's published

Every change to `main` is published to **https://mithya-team.github.io/meridian-website/** by `.github/workflows/pages.yml` (Actions tab). The workflow runs `npm run check` first, so a broken link stops the publish.

On GitHub Pages the site sits in a folder (`/meridian-website`). Write links from the root anyway (`/controls`, `/favicon.svg`): the build adds the folder in front of them. With a custom domain, set `SITE_URL` to it and `BASE_PATH` to `/` in the workflow.

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
| `/request-a-walkthrough` | Request a walkthrough (also the footer's Contact) | `request-a-walkthrough.astro`, `styles/walkthrough.css`, `scripts/walkthrough.js` |
| `/privacy`, `/terms` | Privacy notice, website terms (drafts) | `privacy.astro`, `terms.astro`, `styles/legal.css` |

## Connecting the walkthrough form

Every "Request a walkthrough" button leads to `/request-a-walkthrough`. The form checks what's typed, then sends it to the address in `FORM_ENDPOINT` at the top of `src/pages/request-a-walkthrough.astro`. That is empty today, so on submit the page says plainly that nothing was sent.

To connect it, set `FORM_ENDPOINT` to the URL of your form service or endpoint. It receives a `POST` of form data (`multipart/form-data`) with an `Accept: application/json` header, and any 2xx reply shows the thank-you message. The fields are `name`, `email`, `company`, `job_title`, `team`, `partner_count`, `regions` (repeated, one per ticked region), `notes`, `consent` (`yes`), `source` (the page the visitor came from), and `website`, a trap for bots that must be empty (the script drops entries where it's filled). Then add the service to the "Who we share it with" section of the privacy notice.

## Privacy and Terms

Both are drafts. Every detail the company still has to supply is highlighted on the page and marked `To fill in:` in the source (search for it). Have them reviewed by counsel before launch. If the site adds analytics or cookies, update the privacy notice's Cookies section.

## How it fits together

- `src/layouts/Base.astro`: the head of every page (title, description, icons, share tags), the skip link, the nav and the footer.
- `src/components/`: `Nav.astro`, `Footer.astro` and `Logo.astro`, shared by every page.
- `src/styles/site.css`: the design system (colours, type, cards, chips, buttons, the accordion) and the homepage's sections. Every page imports it first, then its own stylesheet.
- `src/scripts/`: one script per page. Each checks whether the visitor prefers reduced motion and leaves the page fully readable without it.
- `public/`: icons, the web manifest and the share images (`og-*.png`, 1200 × 630, drawn by `brand/web/build_og.py`). `robots.txt` and `sitemap.xml` are written at build time by `astro.config.mjs`, following `LIVE`.
- `src/site.config.mjs`: the live address and the launch switch (see below).

Short class names in `site.css` are already taken (`.t`, `.in`, `.sheet`, `.stage`, `.rail`, `.note`, `.plus`), so page stylesheets use a prefix for their own: `k` (Controls), `fp` (For partners), `q` (Questions), `t` (Teams), `tr` (Trust), `w` (How it works), `c`.

Links between pages use the page's address (`/controls#c-08`, `/teams#role-claims`). Pages with accordions open the right section when the address names one.

## What the copy must keep to

- The product is **Meridian**. Not "Venzi Meridian".
- Say **marketing**, never "field marketing".
- Connections to sign-in, document storage, e-signature, CRM and budget planning are **Planned**, not built. Label them that way.
- Don't claim a certification (SOC 2, ISO 27001). The site states only what is true; open questions live in `strategy/questions-for-the-team.md`, not on the site.
- Prices, and any prospect's name or tools, stay off the site.
- Example people, companies and amounts are fictional.

## Before launch

- [ ] Choose the domain, add it under Settings › Pages, and set `SITE_URL` and `BASE_PATH` in the workflow (share images need the right address).
- [ ] Set `LIVE = true` in `src/site.config.mjs`. That one switch removes the noindex tag, allows crawlers and adds the sitemap.
- [ ] Connect the walkthrough form (see above).
- [ ] Fill in and review the Privacy and Terms pages.
- [ ] Get engineering to sign off the Trust page's eight "True today" claims (`strategy/questions-for-the-team.md`, part 1).
