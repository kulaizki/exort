# Exort

Chess improvement platform. Syncs games from Lichess, analyzes with Stockfish 18, surfaces structured metrics, and provides AI coaching via RAG.

**Live:** [exort.fitzsixto.com](https://exort.fitzsixto.com) | **API:** [api.exort.fitzsixto.com](https://api.exort.fitzsixto.com) | **API Docs:** [api.exort.fitzsixto.com/docs](https://api.exort.fitzsixto.com/docs)

## Tech Stack

| Layer | Stack |
|-------|-------|
| **Web** | SvelteKit 2 + Svelte 5 + Tailwind 4 + Better Auth + Prisma 7 |
| **API** | Express 5 + TypeScript + Prisma 7 + Zod |
| **Sync** | Node.js + TypeScript — Lichess delta sync |
| **Worker** | Python + Stockfish 18 — CPU-bound analysis |
| **Database** | PostgreSQL 16 + Prisma Migrate (auto-deploy) |
| **AI** | Vertex AI Gemini 2.5 Flash — structured SQL RAG |
| **Charts** | Chart.js (SSR-safe via dynamic import) |
| **Infra** | Coolify VPS (all services) + GCP (Vertex AI only) |

## Architecture

```
User authenticates
  -> connects Lichess account
  -> sync fetches new games (NDJSON streaming, delta sync)
  -> games stored in Postgres (idempotent upsert)
  -> user selects games to analyze (single or batch, max 50)
  -> worker runs Stockfish, writes metrics
  -> dashboards display accuracy, blunders, openings, trends
  -> coach chat: SQL retrieval + Vertex AI Gemini
```

## Monorepo Structure

```
exort/
├── apps/
│   ├── web/           SvelteKit frontend + auth
│   ├── api/           Express REST API
│   ├── sync/          Lichess sync service
│   └── worker/        Python + Stockfish analysis
├── packages/
│   └── db/            Shared Prisma schema + client (@exort/db)
├── docs/
│   ├── overview.md    Project overview
│   ├── tech.md        Tech stack & architecture details
│   ├── todo.md        Implementation checklist
│   └── branding.md    Design system & branding guide
├── docker-compose.yml Local Postgres
└── pnpm-workspace.yaml
```

## Local Development

### Prerequisites

- Node.js >= 20
- pnpm 10.x (`corepack enable`)
- Docker (for local Postgres)

### Setup

```bash
# clone
git clone https://github.com/kulaizki/exort.git
cd exort

# install dependencies
pnpm install

# start local postgres
docker compose up -d

# copy env files
cp .env.example .env
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env

# generate a shared secret and set BETTER_AUTH_SECRET in both
# apps/web/.env and apps/api/.env
openssl rand -base64 32

# set up local database (create initial migration)
cd packages/db && npx prisma migrate dev --name init && cd ../..

# run all services
pnpm dev
```

### Environment Variables

**Root `.env`** — Docker Compose Postgres credentials:
```
POSTGRES_USER=exort
POSTGRES_PASSWORD=exort
POSTGRES_DB=exort
```

**`apps/web/.env`**:
```
DATABASE_URL="postgres://exort:exort@localhost:5432/exort"
ORIGIN="http://localhost:5173"
BETTER_AUTH_SECRET="<shared-secret>"
LICHESS_CLIENT_ID="exort"
```

**`apps/api/.env`**:
```
DATABASE_URL="postgres://exort:exort@localhost:5432/exort"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
BETTER_AUTH_SECRET="<shared-secret>"
SYNC_SERVICE_URL="http://localhost:3002"
SYNC_SECRET="<generate-with-openssl-rand>"
```

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run all services (web + api + sync) |
| `pnpm -F @exort/web dev` | Web only |
| `pnpm -F @exort/api dev` | API only |
| `pnpm -F @exort/sync dev` | Sync only |
| `pnpm -F @exort/web check` | Svelte type check |
| `pnpm -F @exort/api test` | Run API tests |
| `pnpm -F @exort/sync test` | Run sync tests |

### Database (from `packages/db/`)

| Command | Description |
|---------|-------------|
| `npx prisma migrate dev --name <name>` | Create a migration (production-bound changes) |
| `npx prisma db push` | Quick-sync schema to local DB (prototyping only) |
| `npx prisma studio` | Open DB browser |
| `npx prisma generate` | Regenerate Prisma Client |
| `npx prisma migrate status` | Check migration status |

### Schema change workflow

```
edit schema.prisma --> prisma migrate dev --name <name> --> git push
```

Production DB updates automatically on deploy. The API container runs `prisma migrate deploy` on startup — no manual steps against production needed. See [docs/database.md](docs/database.md) for details.

## Deployment

All services deployed on a Coolify VPS with Docker. Each app has its own `Dockerfile` (3-stage: build, deps, runtime). Coolify handles reverse proxy (Traefik), SSL, and auto-deploy via GitHub webhooks. The API entrypoint runs `prisma migrate deploy` before starting, so schema changes auto-apply on deploy.

| Service | Domain |
|---------|--------|
| `exort-web` | `exort.fitzsixto.com` |
| `exort-api` | `api.exort.fitzsixto.com` |
| `exort-sync` | `sync.exort.fitzsixto.com` (shared-secret auth) |
| `exort-worker` | Internal only (polls DB) |
| `exort-postgres` | Internal only |

## License

Private project.
