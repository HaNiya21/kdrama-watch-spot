# KDramaDex

A K-drama discovery, tracking, and community platform. Browse dramas via TMDB, track episode-level progress, rate and review shows, and see what the community is watching.

Built with React 18, Vite 5, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, and Framer Motion. The backend (auth, database, edge functions) runs on Lovable Cloud (Supabase under the hood).

## Prerequisites

- Node.js 18+ (20 LTS recommended)
- [Bun](https://bun.sh/) or npm — examples below use `npm`

## Setup

```bash
git clone <your-repo-url>
cd <project-folder>
npm install
```

## Environment variables

The frontend reads a small set of `VITE_`-prefixed variables at build time. Create a `.env` file in the project root:

```env
# Lovable Cloud / Supabase (safe to ship in the browser bundle)
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-anon-key>
VITE_SUPABASE_PROJECT_ID=<your-project-ref>
```

Notes:

- These are the **publishable / anon** values — they are meant to ship to the browser. Row Level Security policies protect the data.
- Never commit a `service_role` key; it must stay server-side only.
- If you connected the project through Lovable Cloud, this `.env` is created for you automatically. If it's missing after a fresh clone, reconnect Lovable Cloud from the project settings.

### Backend-only secrets

The TMDB proxy edge function (`supabase/functions/tmdb-proxy`) needs a TMDB API key. It is **not** a `VITE_` variable — it lives as a backend secret and is only read inside the edge function:

- `TMDB_API_KEY` — get one at https://www.themoviedb.org/settings/api

Store it via the Lovable Cloud secrets UI (or `supabase secrets set TMDB_API_KEY=...` if you use the Supabase CLI directly). Do not put it in `.env`.

## Run locally

```bash
npm run dev
```

The app starts on http://localhost:8080.

## Scripts

| Command             | What it does                                     |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Start the Vite dev server on port 8080           |
| `npm run build`     | Production build to `dist/`                      |
| `npm run build:dev` | Development-mode build (source maps, no minify)  |
| `npm run preview`   | Serve the production build locally               |
| `npm run lint`      | Run ESLint across the project                    |
| `npm run test`      | Run the Vitest test suite once                   |
| `npm run test:watch`| Run Vitest in watch mode                         |

## Project layout

```
src/
  components/        UI components (Navbar, HeroSection, WatchlistTracker, ...)
  pages/             Route-level pages (Index, Browse, DramaDetail, Watchlist, Community, ...)
  contexts/          React contexts (AuthContext)
  hooks/             Reusable hooks (useAggregateRatings, use-toast, ...)
  lib/               Data access + utilities (tmdb, watchlist, recommendations)
  integrations/
    supabase/        Auto-generated Supabase client + types (do not edit)
  index.css          Design tokens (colors, fonts, shadows) — semantic Tailwind theme

supabase/
  functions/         Edge functions (tmdb-proxy)
  migrations/        SQL migrations (schema, RLS policies, views)
```

## Backend overview

- **Auth**: email/password via Supabase Auth, managed through `AuthContext`.
- **Database**: PostgreSQL with Row Level Security on every user-facing table. Users can only read/write their own `watchlist` rows.
- **Public aggregates**: `drama_aggregate_ratings` and `community_feed` views expose anonymized/aggregated data (no `user_id`) to power the community pages.
- **TMDB metadata**: proxied through the `tmdb-proxy` edge function so the TMDB API key never ships to the browser.

## Deployment

The project deploys through Lovable. Open the project in Lovable and use **Share → Publish**. The live URL is provided after the first publish.

If you deploy the build yourself, make sure the same `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` values are present at build time — the Vite build inlines them, and a missing value produces a broken published site with no runtime error.
