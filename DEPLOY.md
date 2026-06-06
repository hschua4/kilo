# Deploying Kilo

Kilo runs as one container on the **Skylab** Hetzner VPS at
**`kilo.hschua.com`**, behind the shared Traefik proxy, using the shared
Postgres. Images are built in GitHub Actions, pushed to GHCR, and pulled on the
VPS — never built on the box. See the infra repo
(`/Users/haisiang/developer/vibe/skylab`) for the proxy + Postgres design.

## What's in this repo for deployment

| File | Purpose |
|---|---|
| `Dockerfile` | `runner` target → app image; `migrator` target → one-shot `prisma migrate deploy`. |
| `docker-compose.yml` | Prod stack for `/srv/kilo`. Joins external `proxy` + `postgres` networks; Traefik labels route `kilo.hschua.com`. |
| `.github/workflows/build.yml` | On push to `main`: lint + `next build` gate → build & push `kilo` and `kilo-migrate` images → trigger deploy. |
| `.github/workflows/deploy.yml` | `workflow_dispatch`: Tailscale → SSH → pull → migrate → rolling swap → smoke test. |
| `.env.production.example` | Template for `/srv/kilo/.env` (chmod 600). |
| `src/app/health/route.ts` | `/health` liveness probe (no DB). |

Build args: none. The app reads `NEXT_PUBLIC_*`? No — all env is server-side and
read at runtime from `.env`, so the same image is environment-agnostic.

## One-time setup

### 1. GitHub
- Create the repo and push (`hschua4/kilo` or similar). GHCR images publish
  under the repo owner: `ghcr.io/<owner>/kilo` and `.../kilo-migrate`.
- Repo **Settings → Secrets → Actions** (mirror the other Skylab apps):
  - `TS_OAUTH_CLIENT_ID`, `TS_OAUTH_SECRET` — Tailscale OAuth (tag `tag:ci`).
  - `DEPLOY_SSH_KEY` — private key of the VPS `deploy` user.
  - `VPS_HOST`, `VPS_USER` — Tailscale host / `deploy`.
- Add an `environment` named **production** (matches `deploy.yml`).

### 2. Infra (on the VPS, in `/srv/infra`)
The `kilo` DB role + database are already wired into the infra repo's
`postgres/bootstrap.sh` and `.env.example` (`KILO_DB_PW`). Set `KILO_DB_PW` in
`/srv/infra/.env`, then:
```bash
cd /srv/infra && ./postgres/bootstrap.sh    # idempotent; creates kilo role+db
```

### 3. Cloudflare DNS
Add a **proxied** A record `kilo` → VPS IPv4 (+ AAAA if applicable). The existing
`*.hschua.com` Origin Cert already covers `kilo.hschua.com`, so no new cert.

### 4. Google OAuth
In Google Cloud Console → Credentials, add the Authorized redirect URI:
```
https://kilo.hschua.com/api/auth/callback/google
```

### 5. VPS env file
```bash
sudo mkdir -p /srv/kilo && sudo chown deploy:deploy /srv/kilo
# copy .env.production.example -> /srv/kilo/.env, fill values:
#   DATABASE_URL=postgresql://kilo:<KILO_DB_PW>@postgres:5432/kilo?schema=public
#   BETTER_AUTH_SECRET=$(openssl rand -hex 32)
#   BETTER_AUTH_URL=https://kilo.hschua.com
#   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / OPENROUTER_API_KEY
chmod 600 /srv/kilo/.env
```

## Deploys

- **Automatic**: push to `main` → `build.yml` runs the CI gate, builds both
  images, then dispatches `deploy.yml` with the short SHA.
- **Manual / rollback**: `gh workflow run deploy.yml -f sha=<short-sha>`.

Deploy steps (on the VPS): `docker compose pull` → `docker compose run --rm
migrate` (applies migrations, halts on failure) → `docker compose up -d kilo`
(start-first rolling swap) → image prune. A smoke test then hits
`https://kilo.hschua.com/health`.

## First manual deploy

Before enabling Actions you can deploy by hand from `/srv/kilo` once images exist
in GHCR (run `build.yml` once via `workflow_dispatch`):
```bash
export GITHUB_OWNER=<owner> IMAGE_TAG=latest
docker compose pull
docker compose run --rm migrate
docker compose up -d kilo
docker compose logs -f kilo
```

## Notes / gotchas

- **Memory**: `mem_limit: 384m`. The 4 GB box is now budgeted to ~2.3 GB of
  hard caps; watch `docker stats` for the first weeks and tune.
- **Prisma 7 + driver adapter**: the client is generated to
  `src/generated/prisma` (gitignored) and regenerated inside the image. The
  standalone build force-includes that dir via `outputFileTracingIncludes` in
  `next.config.ts` so the wasm query compiler ships.
- **Migrations are expand/contract**: `start-first` runs old + new app briefly,
  so migrations must be backward-compatible with the previous release.
- **Password reset emails** are only `console.log`'d (MVP). Wire a real mailer in
  `src/lib/auth.ts` before relying on the reset flow in prod.
