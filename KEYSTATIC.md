# Editing site content (Keystatic CMS)

The site's copy lives in editable content files under `content/`, read at build time
by `src/lib/content.ts`. A visual editor (Keystatic) sits on top so non-developers can
change content without touching code. **Content pages are prerendered to static HTML**;
only the `/keystatic` editor and its API run on-demand as Cloudflare Pages Functions (via
the `@astrojs/cloudflare` adapter). In production the editor is backed by **Keystatic
Cloud**, so the founder and copywriter can edit the live site without GitHub accounts.

## Edit locally now

```bash
npm run cms
```

Then open <http://localhost:4321/keystatic>. Changes you save are written straight to the
JSON files in `content/` (commit them to git to publish).

- `npm run dev` / `npm run build` — the normal site (no editor, fully static).
- `npm run cms` — the site **plus** the `/keystatic` editor.

## What's editable

The editor exposes **structured content** — defined fields the client fills in — never the
page layout, design, or the marketing prose. Adding a post or a team member can't break the
look, because the templates render the fields in fixed layouts.

**Site (singletons)**

- **Homepage banner** (`content/banner/`): show/hide toggle, tag chip, message, and an
  optional link. Free text, so it can carry whatever announcement is current. Off by default.

**Content (collections)**

- **Research & findings** (`content/research/*.json`): title, type (report / brief / case
  study), date, summary, and either an uploaded PDF or an external link. → `/research`.
  The page shows an "in preparation" state until the first entry exists.
- **Blog posts** (`content/posts/*.mdoc`): title, date, author, excerpt, cover image,
  rich-text body. → `/blog` index + `/blog/<slug>` pages.
- **Team members** (`content/team/*.json`): name, role, headshot, bio, sort order. → `/team`.
- **Events** (`content/events/*.json`): title, date, location, image, description. → `/events`.
- **Gallery** (`content/gallery/*.json`): caption, image, sort order. → `/gallery`.

Uploaded images are written to `public/images/<collection>/` and PDFs to
`public/files/research/`, both served statically. The seed entries shipped here (sample
post, events, photos) are placeholders — replace or delete them in the editor.

**Not editable (fixed in templates, by design):** all marketing prose (homepage, Our Story,
Programmes, Research & Findings body copy, Get Involved, Contact, Donate), layout, colours,
and design. Changing those is a developer task.

## Live editing via Keystatic Cloud

The code is wired for Keystatic Cloud (project `virtue-literacy/virtueliteracyafrica`):

- `keystatic.config.ts` — `storage` is `local` in dev (so `npm run cms` edits files
  directly) and `cloud` in production; `cloud.project` points at the Cloud project.
- `astro.config.mjs` — `@astrojs/cloudflare` adapter + the `keystatic()` integration, so
  `/keystatic` and `/api/keystatic/*` deploy as Cloudflare Pages Functions. No env vars or
  GitHub App are needed — Keystatic Cloud manages auth.

**Remaining one-time setup (Cloudflare + Keystatic Cloud dashboards — needs your access):**

1. **Keystatic Cloud dashboard:** connect the `virtue-literacy/virtueliteracyafrica`
   project to the GitHub repo `isaac-ron/virtueliteracyafrica` (installs Cloud's GitHub
   App with write access), and invite the founder + copywriter as editors.
2. **Cloudflare Pages → Settings → Functions → Compatibility flags:** add `nodejs_compat`
   for **both Production and Preview**, and make sure the compatibility date is recent.
   (Keystatic's server code needs Node built-ins on the Workers runtime.)
3. Confirm the Pages build command is `npm run build` and output dir is `dist`.
4. Merge to `main` (or push) → Cloudflare rebuilds → editors sign in at
   `https://<site>/keystatic` via Keystatic Cloud; saves commit to the repo → auto-redeploy.

Tip: push the branch first to get a Cloudflare **preview** deployment and test `/keystatic`
there before merging to `main`.
