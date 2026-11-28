# All-in-one-calculator

A fast, privacy-first web suite of **215+ free online calculators** across Financial, Fitness & Health, Math & Science, and Everyday Utilities — built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

## Architecture Overview

- **Static / SSG Calculator Routes**: `app/[slug]/page.tsx` pre-renders all 215 calculator pages from `data/calculators-index.json` and `data/calculators/<slug>.json`, validated via an allowlist and path-containment guard in `lib/calculators.ts`.
- **Category Hubs & Navigation**: Dedicated hub pages (`/financial-calculator`, `/fitness-and-health-calculator`, `/math-calculator`, `/other-calculator`), live search (`SearchBox`), `Ctrl/Cmd+K` command palette (`CommandPalette`), and `localStorage`-backed history & starred favorites (`HistoryFavoritesModal`).
- **CSP-Safe Client Engines**: `public/js/calc-engines.js`, `public/js/conversion.js`, `public/js/quick-conversion.js`, `public/js/common.js`, and `components/ScientificCalculator.tsx` evaluate math and unit conversions with recursive-descent parsers (no `eval()` or `Function()`).
- **Security & PWA**: `next.config.ts` sets security headers (`CSP`, `HSTS`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`); `/api/health` exposes service health; `public/sw.js` provides offline shell caching.

## Local Development

### Prerequisites

- Node.js `>= 20` (tested on Node `22.x`)
- `npm`

### Setup

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Optional | `https://all-in-one-calculator.vercel.app` | Canonical origin for `metadataBase`, OpenGraph metadata, and `robots.txt` sitemap URL |

## Available Scripts

| Script | Command | Description |
| --- | --- | --- |
| `dev` | `npm run dev` | Start Next.js development server |
| `build` | `npm run build` | Production Webpack build (`next build --webpack`) |
| `start` | `npm run start` | Serve production build |
| `lint` | `npm run lint` | Run ESLint across app & components |
| `typecheck` | `npm run typecheck` | Run TypeScript compiler check (`tsc --noEmit`) |
| `test` | `npm test` | Run all 51 unit, engine accuracy, and security tests |

## Deployment (Vercel)

1. Import the `all-in-one-calculator` repository with default Root Directory (`.`).
2. Framework preset: **Next.js**.
3. Optional environment variable: `NEXT_PUBLIC_SITE_URL=https://all-in-one-calculator.vercel.app`.
4. Health check endpoint: `GET /api/health` returns `{ status: "ok", calculatorCount: 215, ... }`.
