/** Server-only site URL helpers — `APP_ENV` is intentionally NOT prefixed
 * `NEXT_PUBLIC_`, so these must only be called from Server Components /
 * Server Actions. Client components that need this should receive the
 * resolved value(s) as props instead of importing this module. */

const SITE_DOMAIN = (process.env.NEXT_PUBLIC_SITE_URL || "https://motdoi.click").replace(
  /^https?:\/\//,
  ""
);

export function isProdApp(): boolean {
  return process.env.APP_ENV === "PROD";
}

export function getSiteDomain(): string {
  return SITE_DOMAIN;
}

/** Public URL for a project's demo — `https://{slug}.{domain}` when
 * APP_ENV=PROD (each project's real subdomain), otherwise the path-based
 * `/wedding/{slug}` route so local dev keeps working without any DNS/SSL
 * setup. */
export function getDemoUrl(slug: string): string {
  return isProdApp() ? `https://${slug}.${SITE_DOMAIN}` : `/wedding/${slug}`;
}
