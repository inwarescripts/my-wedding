/** Strips Vietnamese diacritics and any character unsafe for a URL slug —
 * shared by project creation/cloning (server) and the editor's slug field
 * (client), since a project's slug doubles as its subdomain
 * (`{slug}.motdoi.click`) and DNS hostnames can't contain non-ASCII
 * characters or most punctuation. */
export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip Vietnamese diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "du-an";
}

/** Lighter, keystroke-safe sibling of `slugify` for live-editing an
 * *existing* slug value in a text input — normalizes case/diacritics/
 * invalid characters but doesn't trim a trailing "-", so typing
 * "minh-linh" one character at a time doesn't have its dash eaten between
 * keystrokes the way `slugify`'s trim would do. */
export function sanitizeSlugInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-");
}
