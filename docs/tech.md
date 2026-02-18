# Exort — Tech Stack & Architecture

## Architecture

- **Web:** SvelteKit 2.52 + Svelte 5 + Tailwind 4 + Better Auth + Prisma 7 (Cloud Run)
- **API:** Express + TypeScript + Prisma ORM (Cloud Run)
- **Sync:** Node.js + TypeScript — Lichess delta sync service (Cloud Run)
- **Worker:** Python + Stockfish 18 + chess library — CPU-bound analysis (VPS)
- **Database:** PostgreSQL 16 (Coolify VPS)
- **AI:** Vertex AI Gemini 2.5 Flash — structured RAG via SQL retrieval

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
- RAG endpoint — structured SQL retrieval + Vertex AI Gemini

Stack:
- Express 5 + TypeScript
- Prisma ORM (schema-first, auto-generated typed client, managed migrations)
- Zod (request validation)
- Vertex AI SDK (@google-cloud/vertexai)

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
4. `api` calls Vertex AI Gemini 2.5 Flash
5. Model returns coaching response (structured JSON + display-friendly text)

Why Gemini 2.5 Flash:
- Long context window for processing multiple retrieved documents
- Low latency — suitable for interactive chat
- Cost-effective on Vertex AI

Why structured SQL over vector embeddings:
- Chess metrics are inherently structured (numbers, categories, timestamps)
- SQL retrieval is deterministic and debuggable
- No embedding pipeline to maintain
- Embeddings may be added later for semantic search over generated summaries

---

## Deployment Model (Hybrid)

### GCP (Cloud Run) — Stateless / Elastic

| Service | Image | Scaling |
|---------|-------|---------|
| `web`   | SvelteKit + adapter-auto | 0-N instances |
| `api`   | Express + Node.js | 0-N instances |
| `sync`  | Node.js scheduled/triggered | 0-1 instances |

### Coolify VPS — Compute + Data Layer

| Service | Notes |
|---------|-------|
| PostgreSQL 16 | Primary database (Coolify-managed) |
| `worker` | Python + Stockfish 18 (Docker, CPU-limited) |

Managed via **Coolify** (self-hosted PaaS):
- One-click Postgres deploy with backups
- Docker-based worker deployment with resource limits
- Built-in reverse proxy (Traefik) + automatic SSL
- GitHub webhook deploys for VPS services

Rationale:
- Cloud Run: scale-to-zero, easy deploy, free tier for low traffic
- Coolify VPS: Stockfish is CPU-bound, more cost-effective on fixed compute
- Postgres near worker: reduces network overhead, predictable costs
- Coolify simplifies VPS ops without Kubernetes overhead

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
- [x] **Hybrid deploy** — Cloud Run for stateless, Coolify VPS for compute + data

- [x] **Coolify** — self-hosted PaaS for VPS management (Postgres, worker, reverse proxy, SSL)
