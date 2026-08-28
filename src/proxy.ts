import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const ROOT_DOMAIN = "motdoi.click";

// A dot in the last path segment (`/flower/chu-hy.webp`, `/og-image.png`)
// means a static file under `public/` — the matcher below only excludes
// Next's OWN asset routes (_next/static, _next/image, favicon.ico,
// icon.png), so anything else in `public/` was falling through to the
// subdomain rewrite below and getting served the wedding page's HTML
// instead of the actual file. That's why every /flower/* image 404'd (well,
// silently swapped) on a project subdomain but worked fine on the root
// domain, where nothing gets rewritten.
const STATIC_FILE = /\.[^/]+$/;

export default auth((req) => {
  const { pathname } = req.nextUrl;
  if (STATIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  const hostname = (req.headers.get("host") || "").split(":")[0].toLowerCase();
  const isRootDomain = hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`;
  const isProjectSubdomain = !isRootDomain && hostname.endsWith(`.${ROOT_DOMAIN}`);

  // Wildcard DNS (`*.motdoi.click` -> Vercel) routes every project
  // subdomain here. Rewrite straight to `/wedding/{slug}` before any auth
  // check runs — subdomains only ever serve the public wedding page, never
  // /admin, so there's nothing below worth reaching for them.
  if (isProjectSubdomain) {
    const slug = hostname.slice(0, -(ROOT_DOMAIN.length + 1));
    const url = req.nextUrl.clone();
    url.pathname = `/wedding/${slug}`;
    return NextResponse.rewrite(url);
  }

  const isLoggedIn = !!req.auth?.user;
  const isAdmin = req.auth?.user?.role === "admin";

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/admin", req.nextUrl));
    }
    return NextResponse.next();
  }

  // The dashboard now serves both roles — admin sees everything, a regular
  // user sees only their own projects/RSVPs — so the gate here just checks
  // "signed in at all". Admin-only areas (e.g. /admin/users) enforce their
  // own stricter check in the page/layout itself.
  if (!isLoggedIn) {
    const loginUrl = new URL("/admin/login", req.nextUrl);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin/users") && !isAdmin) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Broadened from "/admin/:path*" to cover every page request — the
  // subdomain rewrite above needs to run for the public wedding pages too,
  // not just /admin. The early `!pathname.startsWith("/admin")` return
  // keeps the auth check itself scoped to /admin like before.
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|icon\\.png).*)"],
};
