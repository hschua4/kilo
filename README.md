# ScaleIQ

Personal weight tracking and body analytics — log your weight, visualize the
trend, set a goal, and get AI-generated progress insights.

## Stack

- **Next.js 16** (App Router, RSC) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **Prisma 7** + **PostgreSQL** (via the `@prisma/adapter-pg` driver adapter)
- **Better Auth** (email + password, password reset)
- **Apache ECharts** for the trend chart
- **OpenRouter** for AI insights (model configurable, with a rule-based fallback)

## Features

- Email/password auth with password reset, per-user data isolation
- Weight logging: add / edit / delete, one entry per day, full history
- Dashboard: current weight, goal, weekly & monthly change, trend chart
- Trend chart: daily weight + 7-day moving average + goal line, zoomable,
  with 1M / 3M / 6M / 1Y / All ranges
- Goal management: starting weight, target weight, target pace, with a live
  projected completion date
- AI insights: trend summary, plateau detection, and goal projection

## Getting started

### 1. Prerequisites

- Node.js 18+ and a running PostgreSQL instance.

### 2. Environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

- `DATABASE_URL` — your Postgres connection string
- `BETTER_AUTH_SECRET` — generate with `openssl rand -hex 32`
- `BETTER_AUTH_URL` — base URL (default `http://localhost:3000`)
- `OPENROUTER_API_KEY` — optional; without it, insights use a built-in
  rule-based generator
- `OPENROUTER_MODEL` — any OpenRouter model id (default `anthropic/claude-3.5-haiku`)

### 3. Install & migrate

```bash
npm install          # also runs `prisma generate`
npm run db:migrate   # applies migrations to your database
```

### 4. Run

```bash
npm run dev          # http://localhost:3000
```

## Notes

- **Password reset emails** are not wired to a mail provider in this MVP — the
  reset link is printed to the server console. Swap in a real mailer in
  `src/lib/auth.ts` (`sendResetPassword`) for production.
- The Prisma client is generated to `src/generated/prisma` (gitignored) and
  regenerated on `npm install` via the `postinstall` script.

## Project layout

```
src/
  app/
    (auth)/        sign-in, sign-up, forgot/reset password
    (app)/         dashboard, log, goal, insights (auth-guarded)
    api/           auth, entries, goal, insights route handlers
  components/      UI + feature components (chart, tables, forms)
  lib/             auth, prisma, analytics, insights, validation
prisma/            schema + migrations
```
