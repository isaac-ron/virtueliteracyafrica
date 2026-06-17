# Editing site content (Keystatic CMS)

The site's copy lives in editable content files under `content/`, read at build time
by `src/lib/content.ts`. A visual editor (Keystatic) sits on top so non-developers can
change wording without touching code. **The production build stays 100% static** — the
editor is a separate dev/server concern, so the Cloudflare Pages deploy is unaffected.

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

- **Journal name** (`content/journal/`): full **name** + **acronym**.
  Single source of truth — change it once and it updates the banner, nav, footer, homepage
  band, and every page automatically.
- **Homepage banner** (`content/banner/`): show/hide toggle + wording.

**Content (collections)**

- **Blog posts** (`content/posts/*.mdoc`): title, date, author, excerpt, cover image,
  rich-text body. → `/blog` index + `/blog/<slug>` pages.
- **Team members** (`content/team/*.json`): name, role, headshot, bio, sort order. → `/team`.
- **Events** (`content/events/*.json`): title, date, location, image, description. → `/events`.
- **Gallery** (`content/gallery/*.json`): caption, image, sort order. → `/gallery`.

Uploaded images are written to `public/images/<collection>/` and served statically. The
seed entries shipped here (sample posts/team/events/photos) are placeholders — replace or
delete them in the editor.

**Not editable (fixed in templates, by design):** all marketing prose (homepage, Our Story,
Programmes, Get Involved, Contact, Donate, the journal page body), layout, colours, and
design. Changing those is a developer task.

## Letting the client edit on the live site (needs their accounts)

Local editing requires running `npm run cms`. To let the client edit at
`https://<site>/keystatic` with the changes going live automatically, switch Keystatic to
**GitHub mode**:

1. Push this repo to GitHub.
2. In `keystatic.config.ts`, change `storage` to:
   `storage: { kind: 'github', repo: 'OWNER/REPO' }`
3. Create a GitHub App (Keystatic walks you through this on first load in GitHub mode) and
   set the env vars it gives you: `KEYSTATIC_GITHUB_CLIENT_ID`,
   `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`.
4. Add the Cloudflare adapter (`@astrojs/cloudflare`) and include the `keystatic()`
   integration in the build so the `/keystatic` routes deploy as Cloudflare Pages
   Functions. Content pages stay prerendered/static; only the editor runs on-demand.
5. Deploy with those env vars. Editors log in with GitHub at `/keystatic`; saves commit to
   the repo → Cloudflare Pages rebuilds → live.

(Keystatic Cloud is an alternative that removes the GitHub-App step, but it's a hosted
SaaS — GitHub mode keeps everything in your own GitHub + Cloudflare.)
