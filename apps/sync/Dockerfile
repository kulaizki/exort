FROM node:20-slim
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/db/ packages/db/
COPY apps/sync/package.json apps/sync/
RUN pnpm install --frozen-lockfile --filter @exort/sync...
COPY apps/sync/ apps/sync/
RUN pnpm -F @exort/sync build
EXPOSE 3002
CMD ["node", "apps/sync/dist/index.js"]
