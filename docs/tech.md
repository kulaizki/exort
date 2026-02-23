# Exort — Tech Stack & Architecture

## Architecture

- **Web:** SvelteKit 2.52 + Svelte 5 + Tailwind 4 + Better Auth + Prisma 7 (Coolify VPS)
- **API:** Express + TypeScript + Prisma ORM (Coolify VPS)
- **Sync:** Node.js + TypeScript — Lichess delta sync service (Coolify VPS)
- **Worker:** Python + Stockfish 18 + chess library — CPU-bound analysis (Coolify VPS)
- **Database:** PostgreSQL 16 (Coolify VPS)
- **AI:** Gemini 2.5 Flash (Google AI) — structured RAG via SQL retrieval

---

## Services

### 1) web — SvelteKit + Better Auth (Cloud Run)

Responsibilities:
- User authentication (Better Auth — session-based, email/password)
- Connect Lichess username
- Dashboards (games, metrics, summaries)
- RAG chat UI

Stack:
- SvelteKit 2.52 + Svelte 5 (runes)
- Tailwind CSS 4 (@tailwindcss/vite)
- Better Auth 1.4.x (Prisma adapter)
- Prisma 7 (@prisma/adapter-pg)
- adapter-auto (Cloud Run compatible)

Notes:
- Auth handled in `web` via Better Auth with `prismaAdapter`
- Prisma used everywhere — single ORM across monorepo
- API calls use token-based auth to avoid cross-site cookie complexity
- Already scaffolded in `apps/web/`

### 2) api — Express + TypeScript + Prisma (Cloud Run)

Responsibilities:
- Core REST APIs (users, games, metrics, chat)
- Prisma-based DB access (PostgreSQL on VPS)
- Job orchestration (enqueue analysis jobs)
- RAG endpoint — structured SQL retrieval + Gemini API

Stack:
- Express 5 + TypeScript
- Prisma ORM (schema-first, auto-generated typed client, managed migrations)
- Zod (request validation)
- Google Generative AI SDK (@google/generative-ai)

Key patterns:
- Idempotent upserts using Lichess game ID
- Transaction-safe writes via Prisma
- Clear separation between API and worker compute
- Router-based modular route organization

### 3) sync — Node.js + TypeScript (Cloud Run)

Responsibilities:
- Connect to Lichess public API
- Incremental delta sync of new games: `https://lichess.org/api/games/user/{username}`
- Handle retries + rate limits
- Persist new games via `api` (or direct DB writes)
- Trigger analysis by enqueueing jobs

Key patterns:
- Delta synchronization (track last-synced timestamp)
- Deduplication (Lichess game IDs are unique)
- Resilience patterns (exponential backoff, rate limit headers)

### 4) worker — Python + Stockfish (VPS)

Responsibilities:
- Consume analysis jobs from PostgreSQL-backed queue
- Run Stockfish 18 for deterministic evaluation
- Extract structured metrics:
  - Centipawn loss
  - Blunder count
  - Estimated accuracy
  - Opening classification
  - Phase-based error detection
- Write analysis results back to PostgreSQL

Stack:
- Python 3.12+
- chess 1.11.2 (formerly python-chess)
- Stockfish 18 (released Jan 2026)
- PostgreSQL-backed job queue (poll-based, `FOR UPDATE SKIP LOCKED`)

Design:
- CPU-bound workload isolated from API/web services
- Concurrency limited
- Docker CPU quotas enforced
- Async job processing model

Why Postgres-backed queue over Redis/Celery:
- No extra infrastructure (already have Postgres)
- ACID-compliant job enqueue alongside related DB writes
- Perfectly adequate for moderate analysis volumes
- Stockfish analysis takes seconds per game — queue overhead is negligible

---

## RAG Chat Strategy (v1: Structured SQL Retrieval)

RAG is implemented using structured SQL retrieval, not embeddings.

Flow:
1. User asks a question in chat
2. `api` retrieves relevant structured metrics from PostgreSQL:
   - Recent games
   - Worst mistakes
   - Opening frequencies
   - Trend aggregates over time
3. `api` builds a structured context payload
4. `api` calls Gemini 2.5 Flash via Google AI API
5. Model returns coaching response (structured JSON + display-friendly text)

Why Gemini 2.5 Flash:
- Long context window for processing multiple retrieved documents
- Low latency — suitable for interactive chat
- Cost-effective via Gemini API (pay-per-use, generous free tier)

Why structured SQL over vector embeddings:
- Chess metrics are inherently structured (numbers, categories, timestamps)
- SQL retrieval is deterministic and debuggable
- No embedding pipeline to maintain
- Embeddings may be added later for semantic search over generated summaries

---

## Deployment Model (All-in-One VPS)

All services deployed on a single **Coolify VPS**. No external cloud dependencies — AI coaching uses the Gemini API directly (API key auth).

### Coolify VPS

| Service | Domain | Notes |
|---------|--------|-------|
| `exort-web` | `exort.fitzsixto.com` | SvelteKit + adapter-node |
| `exort-api` | `api.exort.fitzsixto.com` | Express + Node.js |
| `exort-sync` | (no domain — triggered by API) | Node.js sync service |
| `exort-worker` | (no domain — polls DB) | Python + Stockfish 18 |
| `exort-postgres` | (internal only) | PostgreSQL 16 |

Managed via **Coolify** (self-hosted PaaS):
- One-click Postgres deploy with persistent volumes + backups
- GitHub repo-based deploys for all services (Dockerfile build pack)
- Internal Docker networking between services (no public DB exposure)
- Built-in reverse proxy (Traefik) + automatic SSL via wildcard `*.fitzsixto.com`
- GitHub webhook deploys for auto-redeploy on push

Rationale:
- Single infrastructure to manage — no Cloud Run config/billing
- All services on same network — fast internal communication
- Coolify simplifies VPS ops without Kubernetes overhead
- Can migrate stateless services to Cloud Run later if scaling is needed

---

## Monorepo Structure

```
exort/
├── apps/
│   ├── web/        # SvelteKit UI + Better Auth (Cloud Run)
│   ├── api/        # Express API + Prisma (Cloud Run)
│   ├── sync/       # Lichess sync service (Cloud Run)
│   └── worker/     # Python + Stockfish analysis (VPS)
├── packages/
│   ├── db/         # shared Prisma schema + generated client (@exort/db)
│   └── shared/     # shared types/contracts (later)
├── docs/
│   ├── overview.md
│   ├── tech.md
│   ├── todo.md
│   └── branding.md
├── package.json
├── pnpm-workspace.yaml
└── .gitignore
```

## Frontend Structure (apps/web)

Feature-based modularization — each feature is self-contained with components, types, and utils.

```
src/lib/
├── features/              # feature modules (self-contained)
│   ├── landing/           # landing page
│   │   ├── components/    # Header, Hero, Features, HowItWorks, CTA, Footer
│   │   │   └── index.ts   # component barrel export
│   │   └── index.ts       # feature barrel export
│   ├── auth/              # login, register, session (future)
│   ├── dashboard/         # overview, stats, charts (future)
│   ├── games/             # game list, game detail (future)
│   └── chat/              # RAG chat UI (future)
├── components/            # shared components (used across features)
│   └── index.ts
├── actions/               # Svelte actions (inview, etc.)
├── stores/                # Svelte 5 state (.svelte.ts) (future)
├── utils/                 # shared utility functions (future)
└── server/                # server-only (auth, prisma)
```

Patterns:
- Two-level barrel exports: `features/[name]/components/index.ts` → `features/[name]/index.ts`
- Routes import from feature: `import { Header, Hero } from '$lib/features/landing'`
- Shared components in `lib/components/`, feature-specific in `lib/features/`
- Server-only code isolated in `lib/server/`

---

## Design Principles

- Deterministic evaluation (Stockfish) separated from generative reasoning (LLM)
- CPU-heavy workloads isolated from API/web services
- Idempotent external synchronization
- Structured retrieval before LLM synthesis
- Hybrid infra chosen for cost/performance realism
- Prisma ORM everywhere via shared `packages/db` — single schema, single ORM across monorepo
- Clear service boundaries suitable for interview discussion

---

## Decisions Made

- [x] **pnpm monorepo** — `apps/web` + `apps/api` + `apps/sync` + `apps/worker`
- [x] **Express** — industry-standard Node.js framework, massive ecosystem, matches target job stack
- [x] **Prisma 7 everywhere** — schema-first, auto-generated client, managed migrations, single ORM
- [x] **Better Auth** — session-based auth, TypeScript-native, Prisma adapter
- [x] **Stockfish 18** — latest (Jan 2026), +46 Elo over v17
- [x] **Postgres-backed job queue** — no extra infra, ACID transactional enqueue
- [x] **Structured SQL RAG** — chess metrics are structured data, not prose
- [x] **Gemini 2.5 Flash** — long context, low latency, cost-effective for chat
- [x] **All-in-one VPS deploy** — all services on Coolify VPS, no external cloud dependencies

- [x] **Coolify** — self-hosted PaaS for VPS management (all services, reverse proxy, SSL)
