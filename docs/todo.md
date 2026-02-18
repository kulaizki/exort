# Exort — Implementation Checklist

## Architecture

- **Web:** SvelteKit 2.52 + Svelte 5 + Tailwind 4 + Better Auth + Prisma 7 → Cloud Run
- **API:** Express + TypeScript + Prisma 7 → Cloud Run
- **Sync:** Node.js + TypeScript — Lichess delta sync → Cloud Run
- **Worker:** Python + Stockfish 18 + chess library → VPS (Docker)
- **Database:** PostgreSQL 16 → VPS
- **AI:** Vertex AI Gemini 2.5 Flash — structured SQL RAG

## Phase 1: Foundation ✅

- [x] Initialize monorepo (pnpm workspaces, concurrently)
- [x] Scaffold SvelteKit frontend (`apps/web`)
- [x] Root `package.json` + `pnpm-workspace.yaml`
- [x] Tailwind CSS 4, ESLint, Prettier configured
- [x] Better Auth + Prisma adapter wired up
- [x] `.env.example` with placeholder DB URL

## Phase 2: Local Dev + Database Schema

- [ ] Docker Compose for local dev (PostgreSQL 16 + pgAdmin optional)
- [ ] Create `packages/db` shared package (`@exort/db`):
  - [ ] Single Prisma schema (owns all models + migrations)
  - [ ] Generated client exported for `web` and `api` to consume
  - [ ] Move Better Auth models from `apps/web/prisma/` into shared schema
- [ ] Design PostgreSQL schema:
  - [ ] `users` (Better Auth managed)
  - [ ] `lichess_accounts` (user_id, lichess_username, last_synced_at)
  - [ ] `games` (lichess_game_id PK, user_id, pgn, time_control, result, played_at, etc.)
  - [ ] `analysis_jobs` (id, game_id, status, created_at, started_at, completed_at)
  - [ ] `game_metrics` (game_id FK, centipawn_loss, blunder_count, accuracy, opening_name, opening_eco, phase_errors JSONB)
  - [ ] `chat_sessions` (id, user_id, created_at)
  - [ ] `chat_messages` (id, session_id, role, content, context JSONB, created_at)
- [ ] Run `prisma db push` against local Postgres
- [ ] Add indexes (games.user_id, games.lichess_game_id, analysis_jobs.status, game_metrics.game_id)
- [ ] Seed script for dev data (optional)

## Phase 2.5: Landing Page

- [ ] Public landing page (`/` route)
  - [ ] Header (logo, nav, sign in / sign up CTAs)
  - [ ] Hero section (tagline, CTA, visual)
  - [ ] Features section (sync, analysis, coaching)
  - [ ] How it works (step-by-step flow)
  - [ ] Final CTA (sign up)
  - [ ] Footer (links, copyright)
- [ ] Follow branding guide (dark + yellow, Manrope, xs radius)

## Phase 3: Auth + Lichess Connect (Web)

- [ ] Better Auth login / register pages (email/password)
- [ ] Lichess OAuth2 login ("Sign in with Lichess"):
  - [ ] Register Lichess OAuth app (`https://lichess.org/account/oauth/app`)
  - [ ] Add Lichess as custom OAuth provider in Better Auth
  - [ ] Auto-link Lichess username on OAuth login (no manual entry needed)
  - [ ] Store in `lichess_accounts` table
- [ ] Session management (hooks.server.ts guard)
- [ ] Dashboard layout (sidebar, auth guard)
- [ ] Profile page (user info, connected Lichess account)

## Phase 4: API Service (Express)

- [ ] Scaffold `apps/api/` (Express + TypeScript)
  - [ ] `package.json` as `@exort/api`
  - [ ] `src/index.ts` entry point
  - [ ] Express app with `/health` route
  - [ ] Import Prisma client from `@exort/db`
- [ ] Auth strategy (web → api):
  - [ ] SvelteKit server-side load functions call API with forwarded session token
  - [ ] Express middleware validates token against Better Auth session table
- [ ] CORS config (allow web origin)
- [ ] Routes:
  - [ ] `GET /games` — list user's games (paginated)
  - [ ] `GET /games/:id` — game detail + metrics
  - [ ] `GET /metrics/summary` — aggregate stats (avg accuracy, blunder rate, opening breakdown)
  - [ ] `GET /metrics/trends` — time-series metrics (weekly/monthly)
  - [ ] `POST /sync/trigger` — trigger Lichess sync for user
  - [ ] `POST /analysis/enqueue` — enqueue analysis job for a game
  - [ ] `GET /analysis/status/:jobId` — poll job status
  - [ ] `POST /chat` — RAG chat endpoint
  - [ ] `GET /chat/sessions` — list user's chat sessions
- [ ] Dockerfile for Cloud Run
- [ ] Add `dev:api` script to root `package.json` + concurrently

## Phase 5: Lichess Sync Service

- [ ] Scaffold `apps/sync/` (Node.js + TypeScript)
  - [ ] `package.json` as `@exort/sync`
  - [ ] Lichess API client (NDJSON streaming)
- [ ] Delta sync logic:
  - [ ] Fetch games since `last_synced_at` from `https://lichess.org/api/games/user/{username}`
  - [ ] Parse NDJSON stream
  - [ ] Idempotent upsert games (ON CONFLICT lichess_game_id DO NOTHING)
  - [ ] Update `last_synced_at` in `lichess_accounts`
- [ ] Rate limit handling (Lichess API: respect 429 + `X-RateLimit-*` headers)
- [ ] Retry with exponential backoff
- [ ] Enqueue analysis jobs for new games
- [ ] Trigger mechanism:
  - [ ] HTTP endpoint (called by API on user request)
  - [ ] Optional: Cloud Scheduler cron (periodic sync for all users)
- [ ] Dockerfile for Cloud Run
- [ ] Add `dev:sync` script to root + concurrently

## Phase 6: Stockfish Worker

- [ ] Scaffold `apps/worker/` (Python)
  - [ ] `requirements.txt` (chess, stockfish wrapper, psycopg2/asyncpg)
  - [ ] Job queue consumer (PgQueuer or Procrastinate)
- [ ] Job queue contract: shared `analysis_jobs` table used by Node.js (INSERT) and Python (consume)
- [ ] Stockfish 18 integration:
  - [ ] Download/bundle Stockfish 18 binary in Docker image
  - [ ] Configure analysis depth (depth 20 recommended)
  - [ ] Time limit per game (prevent runaway analysis)
- [ ] Analysis pipeline per game:
  - [ ] Parse PGN using `chess` library
  - [ ] Run Stockfish evaluation on each move
  - [ ] Compute centipawn loss per move
  - [ ] Count blunders (>200cp loss), mistakes (>100cp), inaccuracies (>50cp)
  - [ ] Estimate overall accuracy (lichess-style formula)
  - [ ] Classify opening (ECO code + name from PGN headers or lookup)
  - [ ] Detect phase-based errors (opening/middlegame/endgame)
- [ ] Write `game_metrics` to PostgreSQL
- [ ] Update `analysis_jobs` status (processing → completed / failed)
- [ ] Dockerfile with:
  - [ ] Stockfish 18 binary
  - [ ] CPU quota limits (`--cpus=1`)
  - [ ] Health check endpoint
- [ ] Concurrency control (process 1-2 games at a time)

## Phase 7: Dashboard UI (Web)

- [ ] Games list page:
  - [ ] Table/cards showing synced games
  - [ ] Status badge (pending analysis / analyzed)
  - [ ] Click to view detail
- [ ] Game detail page:
  - [ ] Game info (opponent, result, time control, opening)
  - [ ] Metrics display (accuracy, blunders, centipawn loss)
  - [ ] Move-by-move eval bar (if time permits)
- [ ] Dashboard overview:
  - [ ] Total games synced
  - [ ] Average accuracy
  - [ ] Blunder rate trend
  - [ ] Most played openings
- [ ] Metrics/trends page:
  - [ ] Line charts (accuracy over time, blunder rate)
  - [ ] Opening breakdown (pie/bar chart)
  - [ ] Time control comparison
- [ ] Sync trigger button ("Sync new games from Lichess")
- [ ] Loading states / skeletons for async data

## Phase 8: RAG Chat

- [ ] Chat UI in web (`/chat` route):
  - [ ] Chat session list (sidebar or tabs)
  - [ ] Message thread (user + assistant messages)
  - [ ] Input form with send button
  - [ ] Streaming response display
- [ ] API endpoint (`POST /chat`):
  - [ ] Accept user message + session_id
  - [ ] Retrieve structured context from PostgreSQL:
    - [ ] Recent N games with metrics
    - [ ] Top blunders / worst games
    - [ ] Opening frequency stats
    - [ ] Trend aggregates (improvement/decline)
  - [ ] Build context payload (structured JSON)
  - [ ] Call Vertex AI Gemini 2.5 Flash with system prompt + context + user question
  - [ ] System prompt: chess coach persona, reference metrics, give actionable advice
  - [ ] Store message + response in `chat_messages`
  - [ ] Return response (streaming preferred)
- [ ] Context limits (don't exceed token budget — trim oldest games first)

## Phase 9: Deploy

- [ ] Deploy `web` to Cloud Run:
  - [ ] Dockerfile or adapter-auto
  - [ ] Environment variables (DATABASE_URL, BETTER_AUTH_SECRET, ORIGIN)
  - [ ] Domain: `exort.fitzsixto.com`
- [ ] Deploy `api` to Cloud Run:
  - [ ] Dockerfile (Express + Node.js)
  - [ ] Environment variables (DATABASE_URL, VERTEX_AI config, CORS)
  - [ ] Domain: `api.exort.fitzsixto.com`
- [ ] Deploy `sync` to Cloud Run:
  - [ ] Dockerfile
  - [ ] Cloud Scheduler trigger (optional)
- [ ] Deploy on Coolify VPS:
  - [ ] PostgreSQL 16 (strong password, restricted access, backup strategy)
  - [ ] `worker` — Docker with Stockfish binary, CPU quotas
  - [ ] Coolify reverse proxy + SSL
- [ ] CI/CD (GitHub Actions):
  - [ ] Build + deploy Cloud Run services on push to main
  - [ ] Per-service triggers (only redeploy changed services)
  - [ ] Coolify webhook or manual deploy for VPS services
- [ ] End-to-end smoke test on production

## Phase 10: Testing

- [ ] API integration tests (Vitest + supertest)
- [ ] Worker unit tests (pytest — Stockfish analysis pipeline)
- [ ] Auth flow E2E test (register → login → session validation)
- [ ] Sync service tests (mock Lichess API responses)

## Phase 11: Polish

- [ ] Error boundaries / empty states
- [ ] Loading skeletons on all async pages
- [ ] Responsive design pass (mobile-first)
- [ ] Rate limiting on API endpoints
- [ ] Security headers (CSP, HSTS, X-Frame-Options)
- [ ] Monitoring / logging (Cloud Run built-in + structured logs)
- [ ] README.md with setup instructions

---

## Non-Goals (v1)

- Embeddings / vector database
- Kubernetes orchestration
- Multi-tenant scaling
- Heavy frontend polish
- Real-time move analysis (only post-game)
- OAuth with Lichess for game data scopes (read-only public games sufficient for v1)

## Decisions Made

- [x] **pnpm monorepo** — `apps/web` + `apps/api` + `apps/sync` + `apps/worker`
- [x] **Express** — industry-standard Node.js framework, massive ecosystem, proven at scale
- [x] **Prisma 7 everywhere** — schema-first, auto-generated client, managed migrations, single ORM
- [x] **Better Auth** — session-based auth, TypeScript-native, Prisma adapter
- [x] **Stockfish 18** — latest (Jan 2026), +46 Elo over v17
- [x] **Postgres-backed job queue** — no extra infra, ACID transactional enqueue
- [x] **Structured SQL RAG** — chess metrics are structured, not prose
- [x] **Gemini 2.5 Flash** — long context, low latency, cost-effective
- [x] **Hybrid deploy** — Cloud Run (stateless) + Coolify VPS (compute + data)

- [x] **Shared `packages/db`** — single Prisma schema consumed by both `web` and `api`
- [x] **Coolify** — self-hosted PaaS for VPS (Postgres, worker), reverse proxy + SSL
