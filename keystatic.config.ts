import { config, fields, singleton, collection } from '@keystatic/core';
import { createElement } from 'react';

// Editing surface = structured content the client can safely manage: one small
// singleton (the homepage banner) plus five collections (research outputs, blog
// posts, team, events, gallery). The page templates render these in fixed
// layouts, so adding entries can't break the design.
export default config({
  // Local files while developing (npm run cms); Keystatic Cloud in production
  // so the founder/copywriter can edit the live site without GitHub accounts.
  storage:
    process.env.NODE_ENV === 'development' ? { kind: 'local' } : { kind: 'cloud' },
  cloud: { project: 'virtue-literacy/virtueliteracyafrica' },
  ui: {
    brand: {
      name: 'Virtue Literacy Africa',
      // Logo shown in the admin sidebar — the one branding lever Keystatic supports.
      mark: () =>
        createElement('img', {
          src: '/logo.svg',
          alt: 'Virtue Literacy Africa',
          style: { height: '24px', width: 'auto', objectFit: 'contain' },
        }),
    },
    navigation: {
      Site: ['banner'],
      Content: ['research', 'posts', 'team', 'events', 'gallery'],
    },
  },
  singletons: {
    /* The homepage announcement strip. Free text so it can carry whatever is current. */
    banner: singleton({
      label: 'Homepage banner',
      path: 'content/banner/',
      format: { data: 'json' },
      schema: {
        show: fields.checkbox({ label: 'Show the banner', defaultValue: false }),
        tag: fields.text({
          label: 'Tag',
          description: 'The small chip at the start of the strip, e.g. "New" or "Notice".',
          defaultValue: 'New',
        }),
        message: fields.text({
          label: 'Message',
          multiline: true,
          description: 'One sentence. Keep it short — the strip is a single line on desktop.',
          defaultValue: '',
        }),
        ctaLabel: fields.text({ label: 'Link label', defaultValue: '' }),
        ctaHref: fields.text({
          label: 'Link destination',
          description: 'A path on this site, e.g. /research, or a full https:// address.',
          defaultValue: '/research',
        }),
      },
    }),
  },

  collections: {
    /* ---------------- Research & findings ----------------
       Standalone reports and briefs, deliberately not issues or volumes. */
    research: collection({
      label: 'Research & findings',
      slugField: 'title',
      path: 'content/research/*',
      format: { data: 'json' },
      columns: ['title', 'publishedDate'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        kind: fields.select({
          label: 'Type',
          options: [
            { label: 'Report', value: 'Report' },
            { label: 'Brief', value: 'Brief' },
            { label: 'Case study', value: 'Case study' },
          ],
          defaultValue: 'Brief',
        }),
        publishedDate: fields.date({
          label: 'Published date',
          defaultValue: { kind: 'today' },
        }),
        summary: fields.text({
          label: 'Summary',
          multiline: true,
          description: 'Two or three sentences: what the question was and what you found.',
        }),
        file: fields.file({
          label: 'PDF',
          directory: 'public/files/research',
          publicPath: '/files/research/',
        }),
        link: fields.url({
          label: 'External link',
          description: 'Use only when the output lives elsewhere. A PDF takes priority over this.',
        }),
      },
    }),

    /* ---------------- Blog / News ---------------- */
    posts: collection({
      label: 'Blog posts',
      slugField: 'title',
      path: 'content/posts/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishedDate'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        publishedDate: fields.date({
          label: 'Published date',
          defaultValue: { kind: 'today' },
        }),
        author: fields.text({ label: 'Author', defaultValue: 'Virtue Literacy Africa' }),
        excerpt: fields.text({
          label: 'Excerpt',
          multiline: true,
          description: 'One- or two-sentence summary shown on the blog index.',
        }),
        coverImage: fields.image({
          label: 'Cover image',
          directory: 'public/images/blog',
          publicPath: '/images/blog/',
        }),
        content: fields.document({
          label: 'Body',
          formatting: true,
          dividers: true,
          links: true,
          lists: true,
          images: {
            directory: 'public/images/blog',
            publicPath: '/images/blog/',
          },
        }),
      },
    }),

    /* ---------------- Team members ---------------- */
    team: collection({
      label: 'Team members',
      slugField: 'name',
      path: 'content/team/*',
      format: { data: 'json' },
      columns: ['name', 'role'],
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        role: fields.text({ label: 'Role / title' }),
        photo: fields.image({
          label: 'Photo',
          directory: 'public/images/team',
          publicPath: '/images/team/',
        }),
        bio: fields.text({ label: 'Short bio', multiline: true }),
        order: fields.integer({ label: 'Sort order', defaultValue: 0 }),
      },
    }),

    /* ---------------- Events ---------------- */
    events: collection({
      label: 'Events',
      slugField: 'title',
      path: 'content/events/*',
      format: { data: 'json' },
      columns: ['title', 'date'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        date: fields.date({ label: 'Date', defaultValue: { kind: 'today' } }),
        location: fields.text({ label: 'Location' }),
        image: fields.image({
          label: 'Image',
          directory: 'public/images/events',
          publicPath: '/images/events/',
        }),
        description: fields.text({ label: 'Description', multiline: true }),
      },
    }),

    /* ---------------- Photo / impact gallery ---------------- */
    gallery: collection({
      label: 'Gallery',
      slugField: 'caption',
      path: 'content/gallery/*',
      format: { data: 'json' },
      columns: ['caption'],
      schema: {
        caption: fields.slug({ name: { label: 'Caption' } }),
        image: fields.image({
          label: 'Image',
          directory: 'public/images/gallery',
          publicPath: '/images/gallery/',
        }),
        order: fields.integer({ label: 'Sort order', defaultValue: 0 }),
      },
    }),
  },
});
