# Multi-stage build for the Next.js web app (Nx monorepo, Bun)
FROM oven/bun:1.3.14 AS builder

WORKDIR /app

COPY package.json bun.lock nx.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
COPY tooling ./tooling
COPY scripts ./scripts

RUN bun install --frozen-lockfile

# Build-time placeholder only — the real value comes from docker-compose at
# runtime. Needed for two unrelated reasons: (1) prisma.config.ts's
# env('DATABASE_URL') validates presence eagerly when the config loads, even
# for `prisma generate`, which never opens a connection; (2) `next build`'s
# page-data-collection pass imports every API route module, and
# packages/db/src/index.ts constructs its PrismaClient at import time —
# never connects during a build, but throws immediately if the var is unset.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

# `bun install` alone never runs Prisma's codegen — without this, @prisma/client
# has no generated PrismaClient export and the build below fails at the
# `packages/db` type-check step.
RUN cd packages/db && bunx prisma generate

ENV NODE_ENV=production
RUN bun run build:web

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages ./packages

USER nextjs
WORKDIR /app/apps/web

EXPOSE 3001

CMD ["npx", "next", "start", "--hostname", "0.0.0.0", "--port", "3001"]
