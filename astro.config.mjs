import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

// Content pages are prerendered to static HTML (read from content/ at build time).
// The Keystatic editor (/keystatic) and its API run on-demand as Cloudflare
// Pages Functions via the adapter, so the live admin works with Keystatic Cloud.
export default defineConfig({
  integrations: [react(), keystatic()],
  adapter: cloudflare(),
});
