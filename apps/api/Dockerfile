FROM node:20-slim AS base
RUN corepack enable

# Stage 1: Build
FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/db/ packages/db/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile
COPY apps/api/ apps/api/
RUN pnpm -F @exort/api build

# Stage 2: Production dependencies
FROM base AS deps
WORKDIR /app
COPY --from=builder /app/apps/api/package.json ./
RUN node -e "const p=JSON.parse(require('fs').readFileSync('package.json','utf8'));for(const t of['dependencies','devDependencies'])if(p[t])for(const[k,v]of Object.entries(p[t]))if(v.startsWith('workspace:'))delete p[t][k];require('fs').writeFileSync('package.json',JSON.stringify(p,null,2))"
RUN npm install --omit=dev --ignore-scripts

# Stage 3: Runtime
FROM node:20-slim AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/index.js"]
