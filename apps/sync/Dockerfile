FROM node:20-slim AS base
RUN corepack enable

FROM base AS build
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/db/ packages/db/
COPY apps/sync/package.json apps/sync/
RUN pnpm install --frozen-lockfile
COPY apps/sync/ apps/sync/
RUN pnpm -F @exort/sync build
RUN pnpm deploy --filter @exort/sync --prod --legacy /app/deploy

FROM base AS runtime
WORKDIR /app
COPY --from=build /app/deploy/node_modules ./node_modules
COPY --from=build /app/apps/sync/dist ./dist
COPY --from=build /app/deploy/package.json ./
ENV NODE_ENV=production
EXPOSE 3002
CMD ["node", "dist/index.js"]
