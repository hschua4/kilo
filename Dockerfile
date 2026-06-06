# Multi-stage build for the Kilo (scale-iq) Next.js 16 app.
# Built in CI, pushed to GHCR, pulled on the Skylab VPS. Never built on the box.
#
# Targets:
#   runner   -> ghcr.io/<owner>/kilo          (minimal standalone app server)
#   migrator -> ghcr.io/<owner>/kilo-migrate  (one-shot `prisma migrate deploy`)

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ---- deps: install with the Prisma schema present so postinstall (prisma
# generate) succeeds. Cached as long as the lockfile + schema are unchanged.
FROM base AS deps
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

# ---- builder: compile the standalone Next.js output.
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Regenerate the Prisma client into src/generated/prisma (no DB connection).
RUN npx prisma generate
# Placeholder values so any module-load-time reads don't crash the build.
# These never reach runtime — the runner stage gets real values from env_file.
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
ENV BETTER_AUTH_SECRET="build-time-placeholder-not-used-at-runtime-000000"
ENV BETTER_AUTH_URL="http://localhost:3000"
RUN npm run build

# ---- runner: minimal production image, runs the traced standalone server.
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["node", "server.js"]

# ---- migrator: tiny image that applies migrations, then exits. Run as a
# one-shot container in the deploy step, before the app is swapped in.
FROM node:22-alpine AS migrator
WORKDIR /app
# Pin the Prisma CLI to the same major as @prisma/client in package.json.
# dotenv is imported by prisma.config.ts; no DB driver needed for migrate deploy.
RUN npm install --no-save --no-package-lock prisma@^7.8.0 dotenv@^17.4.2
COPY prisma.config.ts ./
COPY prisma ./prisma
CMD ["npx", "prisma", "migrate", "deploy"]
