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
RUN mkdir -p /app/db-bundle && \
    echo '{"name":"@exort/db","type":"module","main":"index.js"}' > /app/db-bundle/package.json && \
    pnpm exec esbuild packages/db/src/index.ts --bundle --format=esm --platform=node --outfile=/app/db-bundle/index.js '--external:@prisma/*'

# Stage 2: Production dependencies
FROM base AS deps
WORKDIR /app
COPY --from=builder /app/apps/api/package.json ./
RUN node -e "const p=JSON.parse(require('fs').readFileSync('package.json','utf8'));for(const t of['dependencies','devDependencies'])if(p[t])for(const[k,v]of Object.entries(p[t]))if(v.startsWith('workspace:'))delete p[t][k];require('fs').writeFileSync('package.json',JSON.stringify(p,null,2))"
RUN npm install --omit=dev

# Stage 3: Runtime
FROM node:20-slim AS runtime
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/db-bundle ./node_modules/@exort/db
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
# Prisma schema, migrations, and config for migrate deploy
COPY --from=builder /app/packages/db/prisma ./prisma
COPY --from=builder /app/packages/db/prisma.config.ts ./prisma.config.ts
COPY apps/api/entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh
ENV NODE_ENV=production
EXPOSE 3001
CMD ["./entrypoint.sh"]
