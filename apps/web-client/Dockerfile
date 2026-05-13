# syntax=docker/dockerfile:1.7

FROM node:24-bookworm-slim AS deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/web-client/package.json ./apps/web-client/package.json

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm config set store-dir /pnpm/store \
  && pnpm install --frozen-lockfile --filter @ai-adolescent-mental-health/web-client...

FROM node:24-bookworm-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1

ARG BACKEND_URL=http://backend:8080
ARG NEXT_PUBLIC_WS_BASE_URL=ws://127.0.0.1:8080
ENV BACKEND_URL=$BACKEND_URL
ENV NEXT_PUBLIC_WS_BASE_URL=$NEXT_PUBLIC_WS_BASE_URL

WORKDIR /workspace

RUN corepack enable

COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/apps/web-client/node_modules ./apps/web-client/node_modules
COPY --from=deps /workspace/packages ./packages
COPY . .

RUN pnpm --filter @ai-adolescent-mental-health/web-client build

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3100
ENV BACKEND_URL=http://backend:8080
ENV NEXT_PUBLIC_WS_BASE_URL=ws://127.0.0.1:8080

WORKDIR /app

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=build --chown=nextjs:nodejs /workspace/apps/web-client/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /workspace/apps/web-client/.next/static ./apps/web-client/.next/static
COPY --from=build --chown=nextjs:nodejs /workspace/apps/web-client/public ./apps/web-client/public

USER nextjs

EXPOSE 3100

CMD ["node", "apps/web-client/server.js"]
