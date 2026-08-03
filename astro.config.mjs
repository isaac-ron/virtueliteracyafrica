import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// Content pages are prerendered to static HTML (read from content/ at build time).
// The Keystatic editor (/keystatic) and its API run on-demand as Cloudflare
// Pages Functions via the adapter, so the live admin works with Keystatic Cloud.
export default defineConfig({
  // Required for the sitemap and for absolute URLs in social share tags.
  // Update if the live domain ever changes.
  site: 'https://virtueliteracyafrica.org',
  integrations: [
    react(),
    keystatic(),
    sitemap({
      // The admin is not public content and must never be indexed.
      filter: (page) => !page.includes('/keystatic'),
    }),
  ],
  adapter: cloudflare(),
});
