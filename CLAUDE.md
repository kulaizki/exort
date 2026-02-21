# Exort

## Project

Chess improvement platform — syncs Lichess games, analyzes with Stockfish, AI coaching via RAG.

## Monorepo

- pnpm workspaces, `apps/*` + `packages/*`
- `apps/web` — SvelteKit 2 + Svelte 5 + Tailwind 4 + Better Auth + Prisma 7
- `apps/api` — Express + TypeScript + Prisma 7 (future)
- `apps/sync` — Lichess delta sync (future)
- `apps/worker` — Python + Stockfish 18 (future)
- `packages/db` — shared Prisma schema + client (future)

## Frontend Structure (apps/web)

Feature-based modularization:

```
src/lib/
├── features/          # self-contained feature modules
│   └── [name]/
│       ├── components/
│       │   └── index.ts   # component barrel export
│       └── index.ts       # feature barrel export
├── components/        # shared components (cross-feature)
├── actions/           # Svelte actions (inview, etc.)
├── stores/            # Svelte 5 state (.svelte.ts)
├── utils/             # shared utility functions
└── server/            # server-only (auth, prisma)
```

- Two-level barrel exports: `components/index.ts` → `feature/index.ts`
- Import from feature: `import { Component } from '$lib/features/[name]'`
- Feature-specific components in `features/`, shared in `components/`

## Backend Structure (apps/api)

Feature-based modularization (mirrors frontend pattern):

```
src/
├── index.ts               # Express app entry, middleware, route registration
├── config/
│   └── index.ts           # env config (dotenv + Zod validation)
├── middleware/
│   ├── auth.ts            # session validation (Better Auth token check)
│   ├── cors.ts            # CORS config
│   └── error.ts           # global error handler
├── features/
│   ├── index.ts           # barrel: aggregates all routers
│   ├── games/
│   │   ├── index.ts       # barrel export
│   │   ├── router.ts      # Express Router (GET /games, GET /games/:id)
│   │   ├── schema.ts      # Zod schemas (request params, query, response)
│   │   └── service.ts     # business logic (Prisma queries)
│   ├── metrics/
│   │   ├── index.ts
│   │   ├── router.ts      # GET /metrics/summary, GET /metrics/trends
│   │   ├── schema.ts
│   │   └── service.ts
│   ├── sync/
│   │   ├── index.ts
│   │   ├── router.ts      # POST /sync/trigger
│   │   └── service.ts
│   ├── analysis/
│   │   ├── index.ts
│   │   ├── router.ts      # POST /analysis/enqueue, POST /analysis/batch-enqueue, GET /analysis/status/:id
│   │   ├── schema.ts
│   │   └── service.ts
│   ├── coach/
│   │   ├── index.ts
│   │   ├── router.ts      # CRUD sessions + messages, Vertex AI integration
│   │   ├── schema.ts
│   │   └── service.ts
│   ├── profile/
│   │   ├── index.ts
│   │   ├── router.ts      # GET/PATCH /profile
│   │   ├── schema.ts
│   │   └── service.ts
│   └── lichess/
│       ├── index.ts
│       ├── router.ts      # POST /lichess/connect, DELETE /lichess/disconnect
│       └── service.ts
└── utils/                 # shared helpers (pagination, response formatting)
```

- Three-layer per feature: **router** (HTTP) → **service** (logic) → **Prisma** (data)
- Zod schemas validate all request params, query strings, and bodies
- Barrel exports: `features/games/index.ts` → `features/index.ts`
- Import from feature: `import { gamesRouter } from './features'`
- Routers define their own prefix: `router = Router(); app.use('/games', gamesRouter)`

## Sync Service Structure (apps/sync)

```
src/
├── index.ts               # entry point (HTTP trigger or scheduler)
├── config/
│   └── index.ts
├── lichess/
│   ├── client.ts          # Lichess API client (NDJSON streaming)
│   ├── parser.ts          # parse NDJSON → typed game objects
│   └── types.ts           # Lichess API response types
├── sync/
│   ├── service.ts         # delta sync logic (upsert games, update last_synced_at)
│   └── mapper.ts          # map Lichess API data → DB schema fields
└── jobs/
    └── enqueue.ts         # enqueue analysis jobs for new games
```

## Testing

- **API**: Vitest + supertest (integration tests against real endpoints)
- **Sync**: Vitest (unit tests with mocked Lichess API responses)
- **Worker**: pytest (unit tests for Stockfish analysis pipeline)
- **Web**: Vitest + Playwright (E2E for auth flow)
- Tests colocated: `apps/api/src/features/games/__tests__/games.test.ts`
- Naming: `[feature].test.ts` for unit/integration, `[feature].e2e.ts` for E2E
- Run: `pnpm -F @exort/api test`, `pnpm -F @exort/web test`

## Branding

- Dark theme only (#0A0A0A bg)
- Gold accent (#FFB800), no gradients on text
- Ubuntu font (body, 400/500/700), Ubuntu Mono (logo wordmark, 700)
- Minimal border radius: `rounded-sm` (4px), `rounded` (6px) only
- No heavy shadows or glow effects

## Commands

- `pnpm dev` — run all services via concurrently
- `pnpm -F @exort/web dev` — web only
- `pnpm -F @exort/web check` — svelte-check
- `pnpm -F @exort/api dev` — api only
- `pnpm -F @exort/api test` — run api tests (vitest)
- `pnpm -F @exort/sync test` — run sync tests (vitest)

### Database (run from `packages/db/`)

- `npx prisma migrate dev --name <name>` — create migration (use for all production-bound changes)
- `npx prisma db push` — quick-sync schema to local DB (prototyping only, no migration file)
- `npx prisma studio` — open DB browser
- `npx prisma generate` — regenerate Prisma Client
- `npx prisma migrate status` — check migration status

## Conventions

- Conventional commits (single line, scoped)
- Svelte 5 runes ($state, $derived, $effect), no legacy stores
- Tailwind 4 with @theme for custom tokens
- Server deps can go in devDependencies (SvelteKit bundles them)
- Zod for all API request/response validation
- Feature boundaries: features never import from other features' internals
- Services own all business logic; routers are thin HTTP adapters
- Tests colocated with features in `__tests__/` dirs
