import { config, fields, singleton, collection } from '@keystatic/core';

// Editing surface = structured content the client can safely manage:
// two small singletons (journal name, homepage banner) plus four collections
// (blog posts, team, events, gallery). The page templates render these in fixed
// layouts, so adding entries can't break the design.
export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Virtue Literacy Africa' },
    navigation: {
      Site: ['journal', 'banner'],
      Content: ['posts', 'team', 'events', 'gallery'],
    },
  },
  singletons: {
    /* The one bit of fixed copy that keeps changing — edit once, updates everywhere. */
    journal: singleton({
      label: 'Journal name',
      path: 'content/journal/',
      format: { data: 'json' },
      schema: {
        name: fields.text({
          label: 'Full name',
          description: 'Updates the homepage banner, nav, footer, and every page automatically.',
          defaultValue: 'African Journal of Governance, AI and Development',
        }),
        acronym: fields.text({ label: 'Acronym', defaultValue: 'AJGAD' }),
      },
    }),

    /* The homepage announcement strip. */
    banner: singleton({
      label: 'Homepage banner',
      path: 'content/banner/',
      format: { data: 'json' },
      schema: {
        show: fields.checkbox({ label: 'Show the banner', defaultValue: true }),
        tag: fields.text({ label: 'Tag', defaultValue: 'New' }),
        leadIn: fields.text({ label: 'Lead-in text', defaultValue: 'Introducing' }),
        tail: fields.text({
          label: 'Trailing text (after the journal name)',
          defaultValue: '— our new peer-reviewed, open-access journal.',
        }),
        ctaLabel: fields.text({ label: 'Link label', defaultValue: 'Explore the journal →' }),
      },
    }),
  },

  collections: {
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
