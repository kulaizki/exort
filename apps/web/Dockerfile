FROM node:20-slim AS base
RUN corepack enable

# Stage 1: Build
FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/db/ packages/db/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile
COPY apps/web/ apps/web/
RUN pnpm -F @exort/web build

# Stage 2: Production dependencies
FROM base AS deps
WORKDIR /app
COPY --from=builder /app/apps/web/package.json ./
RUN node -e "const p=JSON.parse(require('fs').readFileSync('package.json','utf8'));for(const t of['dependencies','devDependencies'])if(p[t])for(const[k,v]of Object.entries(p[t]))if(v.startsWith('workspace:'))delete p[t][k];require('fs').writeFileSync('package.json',JSON.stringify(p,null,2))"
RUN npm install --omit=dev --ignore-scripts

# Stage 3: Runtime
FROM node:20-slim AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/build ./build
COPY --from=builder /app/apps/web/package.json ./
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "build"]
