import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

// The Keystatic editor (/keystatic) runs as on-demand routes, so it's only
// enabled when ENABLE_KEYSTATIC=true (the `npm run cms` script). The normal
// `npm run build` stays 100% static — no adapter — so the Cloudflare Pages
// deploy is unchanged.
const enableAdmin = process.env.ENABLE_KEYSTATIC === 'true';

export default defineConfig({
  // Static output — served directly from Cloudflare Pages' dist/
  // Pages read their copy from content/ via the Keystatic reader at build time.
  integrations: [react(), ...(enableAdmin ? [keystatic()] : [])],
});
