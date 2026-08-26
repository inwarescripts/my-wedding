# Wedding Studio

A Next.js platform for building and hosting premium Vietnamese wedding websites: a public marketing homepage, a per-couple public wedding site (`/wedding/[slug]`), and an admin CMS (`/admin`) for creating and editing projects, RSVPs, guestbook moderation, and users.

## Tech stack

- **Next.js 16** (App Router, Webpack build — Turbopack is disabled via `--webpack` on both `dev` and `build`)
- **TypeScript**, **Tailwind CSS v4**
- **Prisma 5** + **PostgreSQL** (developed against [Neon](https://neon.tech))
- **NextAuth v5** (Credentials provider, JWT sessions) for admin auth
- **AWS S3** for uploaded media (presigned uploads)
- **react-three-fiber / three.js** for the 3D opening/gallery effects
- Server Actions throughout — there are no REST API routes to configure

## Environment variables

Copy these into a local `.env` (never commit it — `.env*` is already gitignored) and into your Vercel project's Environment Variables:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. If using Neon, use the **pooled** connection string here (the one with `-pooler` in the hostname) — this is what the running app uses. |
| `AUTH_SECRET` | NextAuth session secret. Generate a fresh one for production with `npx auth secret` — do not reuse the value from local `.env`. |
| `S3_REGION` | AWS region of the media bucket, e.g. `ap-southeast-1`. |
| `S3_BUCKET` | S3 bucket name for uploaded media. |
| `S3_KEY` / `S3_SECRET` | IAM credentials with read/write access to that bucket. |
| `S3_PREFIX` | Key prefix uploads are namespaced under, e.g. `assets/wedding` (useful if the bucket is shared with other apps). |

Add the S3 bucket's public hostname to `images.remotePatterns` in `next.config.ts` if it isn't already covered by the existing `*.s3.*.amazonaws.com` pattern (e.g. a custom CDN domain).

## Local development

```bash
npm install                # also runs `prisma generate` via postinstall
npm run db:migrate         # applies prisma/migrations to your DATABASE_URL
npm run db:seed            # creates the seed admin user + sample content
npm run dev
```

`npm run build` also runs `prisma generate` itself (not just `postinstall`) — Vercel caches `node_modules` between builds and can skip `postinstall` on a cache hit, which leaves a stale/outdated Prisma Client and breaks the build (`PrismaClientInitializationError: ...auto-generation isn't triggered`). Regenerating as an explicit first step of `build` avoids that regardless of caching.

Open [http://localhost:3000](http://localhost:3000). Admin login is at `/admin/login` — the seeded admin's password is set in `prisma/seed.ts`; **change it immediately** via the admin Users page after first login (or edit the seed script before running it against a real environment).

## Deploying to Vercel

1. **Push this repo to GitHub/GitLab/Bitbucket** and import it in Vercel as a new project. Vercel auto-detects the Next.js `build`/`start` scripts — no custom build command is required.
2. **Set all the environment variables above** in the Vercel project (Settings → Environment Variables), for both the *Production* and *Preview* environments. `DATABASE_URL` in particular must be available **at build time**, not just at runtime — see the note below on the homepage.
3. **Apply migrations to the target database** before (or right after) the first deploy:
   ```bash
   DATABASE_URL="<production connection string>" npm run db:deploy
   ```
   Run this from your machine (or a one-off Vercel deploy hook) — it is *not* run automatically as part of `next build`. Prefer a **direct** (non-pooled) connection string for this command; some pooled connections (e.g. Neon's PgBouncer pooler) don't support the session-level advisory locks Prisma's migration engine needs and will fail or hang. The app itself should keep using the pooled URL for `DATABASE_URL`.
   ⚠️ Run `db:deploy`, not `db:migrate` — `migrate dev` is for local development only and will prompt interactively / can drift schema in ways unsuitable for a shared production database.
4. **Seed data**, only if the target database is empty:
   ```bash
   DATABASE_URL="<production connection string>" npm run db:seed
   ```
5. **S3 bucket CORS**: the admin editor uploads media directly to S3 via presigned URLs from the browser, so the bucket needs a CORS policy allowing `PUT`/`POST` from your Vercel domain(s) (production domain + `*.vercel.app` preview URLs, if you want uploads to work in previews too).
6. Deploy. Log in at `/admin/login`, change the seeded admin password, and start creating projects.

### Known gotcha: the homepage's template gallery is static

`src/app/page.tsx` (the `/` marketing homepage) queries published projects for its template gallery and is statically generated at build time — it has no ISR `revalidate` configured. That means **publishing a new wedding project won't show up on the homepage until the next deploy**. Individual wedding sites (`/wedding/[slug]`) and the admin dashboard are server-rendered per request and always reflect live data. If you want the homepage gallery to update without a redeploy, add a `revalidate` export (or switch that fetch to `noStore()`/dynamic rendering).

## Scripts reference

| Script | What it does |
| --- | --- |
| `npm run dev` | Local dev server (Webpack, not Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve a production build (`npm run build` first) |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Create/apply a migration locally (`prisma migrate dev`) |
| `npm run db:deploy` | Apply existing migrations to a target database (`prisma migrate deploy`) — use this for production/Vercel |
| `npm run db:seed` | Run `prisma/seed.ts` |
| `npm run db:studio` | Open Prisma Studio against `DATABASE_URL` |
