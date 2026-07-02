# Multi-stage build for the Next.js web app (Nx monorepo, Bun)
FROM oven/bun:1.3.14 AS builder

WORKDIR /app

COPY package.json bun.lock nx.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
COPY tooling ./tooling
COPY scripts ./scripts

RUN bun install --frozen-lockfile

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
