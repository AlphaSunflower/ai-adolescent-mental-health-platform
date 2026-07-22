# syntax=docker/dockerfile:1.7

# ===== Stage 1: Dependencies =====
FROM node:24-bookworm-slim AS deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/admin-portal/package.json ./apps/admin-portal/package.json

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm config set store-dir /pnpm/store \
  && pnpm install --frozen-lockfile --filter @ai-adolescent-mental-health/admin-portal...

# ===== Stage 2: Build =====
FROM node:24-bookworm-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1

ARG BACKEND_URL
ENV BACKEND_URL=$BACKEND_URL

WORKDIR /workspace

RUN corepack enable

COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/apps/admin-portal/node_modules ./apps/admin-portal/node_modules
COPY --from=deps /workspace/packages ./packages
COPY . .

RUN test -n "$BACKEND_URL" || (echo "ERROR: BACKEND_URL build-arg is required" >&2 && exit 1)
RUN pnpm --filter @ai-adolescent-mental-health/admin-portal build

# ===== Stage 3: Runtime =====
FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3101
ENV BACKEND_URL=http://backend:8080

WORKDIR /app

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=build --chown=nextjs:nodejs /workspace/apps/admin-portal/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /workspace/apps/admin-portal/.next/static ./apps/admin-portal/.next/static
COPY --from=build --chown=nextjs:nodejs /workspace/apps/admin-portal/public ./apps/admin-portal/public

USER nextjs

EXPOSE 3101

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=30s \
  CMD wget -qO- http://localhost:3101/api/health || exit 1

CMD ["node", "apps/admin-portal/server.js"]
