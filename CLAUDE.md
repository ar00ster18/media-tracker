# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start Next.js dev server on localhost:3000

# Quality checks
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler check (no emit)
npm run full-test        # lint + type-check + unit tests (run before PRs)

# Testing
npm run test:unit        # Run all Vitest unit tests once
npx vitest <pattern>     # Run a specific test file, e.g. npx vitest MediaSearch
npm run test:e2e         # Run Cypress tests headlessly
npm run cypress:open     # Open Cypress interactive runner

# Database
npx prisma migrate dev   # Apply migrations and regenerate client (uses DATABASE_URL_UNPOOLED from .env)
npx prisma generate      # Regenerate Prisma client after schema changes
npx prisma studio        # Open Prisma Studio GUI

# Deployment (Vercel via opennextjs-cloudflare)
npm run preview          # Build and preview locally with Wrangler
npm run deploy           # Build and deploy to Cloudflare via OpenNext
```

## Environment Variables

Required in `.env`:
- `DATABASE_URL` — Neon pooled connection string (used at runtime by the Prisma Neon adapter)
- `DATABASE_URL_UNPOOLED` — Neon direct connection string (used by `prisma.config.ts` for migrations)
- `TMDB_TOKEN` — TMDB API Bearer token
- `OMDB_TOKEN` — OMDB API key
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth credentials
- `NEXT_PUBLIC_APP_URL` — Public base URL (used by `auth-client.ts`, defaults to `http://localhost:3000`)

## Architecture

### Stack
Next.js 16 (App Router) + TypeScript + Tailwind CSS v4. Auth via **better-auth**. Database is **Neon (PostgreSQL)** accessed through Prisma with the `@prisma/adapter-neon` serverless adapter. Deployed to **Vercel** (previously Cloudflare via `opennextjs-cloudflare` — the wrangler/open-next config is still present but unused for deployment).

### Route Groups
- `src/app/(auth)/` — Unauthenticated routes (sign-in page). No shared layout.
- `src/app/(main)/` — Authenticated routes. The layout (`src/app/(main)/layout.tsx`) is a **client component** that reads the session with `authClient.useSession()` and redirects unauthenticated users to `/sign-in`. All pages inside `(main)` can assume a valid session exists.

### Auth Flow
- Server: `src/lib/auth.ts` initializes better-auth with the Prisma adapter. Email/password and Google OAuth are enabled. The catch-all route `src/app/api/auth/[...all]/route.ts` handles all auth API calls.
- Client: `src/lib/auth-client.ts` exports `authClient` (a better-auth React client). Components use `authClient.useSession()` for reactive session state. Server-side session checks in API routes use `auth.api.getSession({ headers: await headers() })`.

### Two Parallel List Systems
There are **two separate data models** for tracking items, both using the same `WatchStatus` enum (`PLAN_TO_WATCH | WATCHING | WATCHED`):

1. **WatchLog** (the main system used by the Movies/TV pages): Each `WatchLog` is a `(userId, mediaId)` unique pair. Stores user rating and notes. API at `/api/watchlist` (GET/POST/DELETE). The `WatchlistAside` component syncs to this endpoint.

2. **UserListItem** (a leaner secondary system): Also `(userId, mediaId)` unique, but only stores status (no rating/notes). API at `/api/my-list` (GET/POST/PATCH/DELETE). This appears to be a simpler alternative list implementation.

Both systems upsert a `MediaItem` row (keyed by TMDB ID) before creating the list entry.

### Media Data Flow
- `src/lib/media.ts` — All TMDB and OMDB API calls. Functions are called server-side only (token is server-only via `process.env.TMDB_TOKEN`).
- `/api/media` — Proxy route that the client calls. Supports `type` (movie/tv), optional `query`, `page`, and `action=ratings` to fetch multi-source ratings (TMDB + IMDB via OMDB + Rotten Tomatoes).
- Ratings are fetched asynchronously per item after the initial search results render, then merged into state.
- TMDB image URLs are constructed via `getTMDBImageUrl()` from `src/lib/media.ts`. The `next.config.ts` allowlists `image.tmdb.org` for `next/image`.

### MediaSearch Component
`src/components/MediaSearch.tsx` is the catalog browser used on both the Movies and TV pages. It handles search with 500ms debounce, pagination via "Load More" (appending results), and a modal for selecting status + rating before adding. It calls back to the page via `onAddToMyList(item, status, rating)`.

### Prisma Client Singleton
`src/lib/prisma.ts` uses the Neon serverless adapter with a WebSocket shim for local Node.js environments. A global singleton prevents multiple client instances in dev due to hot reload.

### UI Components
Shared primitives live in `src/components/ui/`: `Button`, `Input`, `Select`, `Spinner`. These are plain React components styled with Tailwind — not a third-party library.

### Status String Convention
The DB uses enum values `PLAN_TO_WATCH | WATCHING | WATCHED`. The client uses kebab-case strings `"plan-to-watch" | "watching" | "watched"`. Conversion happens at the API boundary in each route handler.

### Stats
`/api/stats` aggregates WatchLog data into counts by status/type, top genres (from `MediaItem.genres[]`), monthly activity (last 6 months), and average user rating. The `src/app/(main)/stats/page.tsx` renders this with Recharts pie and bar charts.

### Testing
- **Unit tests**: Vitest with jsdom + React Testing Library. Test files colocated next to components (`.test.tsx`). Setup file at `src/__tests__/setup.ts`.
- **E2E tests**: Cypress. Tests in `cypress/e2e/`. The sign-in page exposes a "Auto-login as Dev User" button in development mode only (`process.env.NODE_ENV === "development"`) that auto-creates `dev@example.com` / `Password123!` if it doesn't exist.
