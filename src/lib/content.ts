import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';

// Reads Keystatic-managed content from the repo at build time, so the site
// stays fully static. Editors change these files via the /keystatic UI.
export const reader = createReader(process.cwd(), keystaticConfig);

/** Split a multiline text field into paragraphs (blank line = new paragraph). */
export function paragraphs(text: string | undefined | null): string[] {
  if (!text) return [];
  return text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
}

/**
 * Resolve a Keystatic image or file field to a usable URL. The reader returns the
 * bare filename; prefix the collection's public path. Guarded so an already-absolute
 * value (e.g. from a future editor change) isn't double-prefixed.
 */
export function asset(value: string | null | undefined, prefix: string): string {
  if (!value) return '';
  return value.startsWith('/') || value.startsWith('http') ? value : prefix + value;
}
