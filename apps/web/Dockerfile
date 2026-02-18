FROM node:20-slim AS base
RUN corepack enable

FROM base AS build
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/db/package.json packages/db/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile
COPY packages/db/ packages/db/
COPY apps/web/ apps/web/
RUN pnpm -F @exort/db db:generate
RUN pnpm -F @exort/web build

FROM base AS runtime
WORKDIR /app
COPY --from=build /app/apps/web/build ./build
COPY --from=build /app/apps/web/package.json ./
COPY --from=build /app/node_modules ./node_modules
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "build"]
