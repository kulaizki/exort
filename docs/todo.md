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
- [x] Feature-based frontend structure (`lib/features/`, barrel exports)
- [x] Branding guide + gold theme + Ubuntu/Ubuntu Mono fonts
- [x] `CLAUDE.md` project conventions

## Phase 2: Local Dev + Database Schema

- [ ] Docker Compose for local dev (PostgreSQL 16 + pgAdmin optional)
- [ ] Create `packages/db` shared package (`@exort/db`):
  - [ ] Single Prisma schema (owns all models + migrations)
  - [ ] Generated client exported for `web` and `api` to consume
  - [ ] Move Better Auth models from `apps/web/prisma/` into shared schema
- [ ] Design PostgreSQL schema:
  - [ ] `users` (Better Auth managed)
  - [ ] `lichess_accounts` (user_id, lichess_username, last_synced_at)
  - [ ] `games` (lichess_game_id PK, user_id, pgn, time_control, result, played_at, opponent, color, rated, variant, clock_initial, clock_increment, player_rating, opponent_rating, status)
  - [ ] `analysis_jobs` (id, game_id, status enum [pending/processing/completed/failed], created_at, started_at, completed_at)
  - [ ] `game_metrics` (game_id FK, centipawn_loss, accuracy, blunder_count, mistake_count, inaccuracy_count, opening_name, opening_eco, phase_errors JSONB)
  - [ ] `move_evaluations` (id, game_id FK, move_number, color, eval_cp, best_move_uci, played_move_uci, classification enum [blunder/mistake/inaccuracy/good/excellent/brilliant])
  - [ ] `chat_sessions` (id, user_id, title, game_id FK nullable, created_at)
  - [ ] `chat_messages` (id, session_id FK, role enum [user/assistant], content, context JSONB, created_at)
- [ ] Run `prisma db push` against local Postgres
- [ ] Add indexes:
  - [ ] `games`: user_id, lichess_game_id (unique), played_at, time_control
  - [ ] `analysis_jobs`: status, game_id
  - [ ] `game_metrics`: game_id
  - [ ] `move_evaluations`: game_id, (game_id + move_number) composite
  - [ ] `chat_sessions`: user_id
  - [ ] `chat_messages`: session_id
- [ ] Seed script for dev data (optional)

## Phase 2.5: Landing Page ✅

- [x] Public landing page (`/` route)
  - [x] Header (floating nav, logo, centered links, sign in / get started CTAs, full-width mobile)
  - [x] Hero section (tagline, CTA, tech specs row, interactive chessboard canvas background)
  - [x] Features section (bento grid with mock UI elements — eval bar, game feed, chat)
  - [x] How it works (3-step flow with circular badges, bullet details)
  - [x] Final CTA (gold border, corner accents, benefits row)
  - [x] Footer (brand + logo, link columns, GitHub, copyright)
- [x] Follow branding guide (dark + gold, xs radius)
- [x] Custom logo (gold flame SVG, cropped viewBox)
- [x] Fonts: Ubuntu (body), Ubuntu Mono (logo wordmark)
- [x] Shared `ChessboardBg` component (`$lib/components/`)
- [x] `<svelte:head>` titles + OG/Twitter meta on all pages
- [x] Favicon updated to exort logo SVG
- [x] Lowercase minimal titles and descriptions

## Phase 3: Auth + Lichess Connect (Web)

- [x] Better Auth login / register pages (email/password)
  - [x] Login page (`/login`) with form actions, error display, themed UI
  - [x] Register page (`/register`) with form actions, error display, themed UI
  - [x] Feature-based structure (`$lib/features/auth/`)
  - [x] Interactive chessboard background on auth pages
  - [x] Back buttons linking to landing page
  - [x] "Sign in/up with Lichess" button UI (official Lichess knight logo)
  - [x] Login field accepts "Username or email"
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
  - [ ] `src/index.ts` entry point (Express app, middleware registration, route mounting)
  - [ ] `src/config/index.ts` — env config with Zod validation
  - [ ] Express app with `/health` route
  - [ ] Import Prisma client from `@exort/db`
- [ ] Feature-based structure (`src/features/`):
  - [ ] Each feature: `router.ts` (HTTP) → `service.ts` (logic) → Prisma (data)
  - [ ] `schema.ts` per feature — Zod request/response validation
  - [ ] Barrel exports: `features/[name]/index.ts` → `features/index.ts`
  - [ ] Features: games, metrics, sync, analysis, coach, profile, lichess
- [ ] Middleware (`src/middleware/`):
  - [ ] `auth.ts` — session validation (Better Auth token check against session table)
  - [ ] `cors.ts` — CORS config (allow web origin)
  - [ ] `error.ts` — global error handler (Zod errors → 400, unknown → 500)
- [ ] Auth strategy (web → api):
  - [ ] SvelteKit server-side load functions call API with forwarded session token
  - [ ] Express middleware validates token against Better Auth session table
- [ ] Routes:
  - [ ] **Games:**
    - [ ] `GET /games` — list user's games (paginated, filterable by time_control, result, date range, opening)
    - [ ] `GET /games/:id` — game detail + metrics + move evaluations
  - [ ] **Metrics:**
    - [ ] `GET /metrics/summary` — aggregate stats (avg accuracy, blunder/mistake/inaccuracy rates, opening breakdown)
    - [ ] `GET /metrics/trends` — time-series metrics (weekly/monthly accuracy, blunder rate)
  - [ ] **Sync:**
    - [ ] `POST /sync/trigger` — trigger Lichess sync for user
  - [ ] **Analysis:**
    - [ ] `POST /analysis/enqueue` — enqueue analysis job for a game
    - [ ] `GET /analysis/status/:jobId` — poll job status
  - [ ] **Coach (Chat):**
    - [ ] `POST /chat/sessions` — create new chat session (optional game_id for game-specific coaching)
    - [ ] `GET /chat/sessions` — list user's chat sessions
    - [ ] `DELETE /chat/sessions/:id` — delete a chat session
    - [ ] `GET /chat/sessions/:id/messages` — load messages for a session
    - [ ] `POST /chat/sessions/:id/messages` — send message, get AI response (streaming)
  - [ ] **Settings:**
    - [ ] `GET /profile` — user info + connected Lichess account
    - [ ] `PATCH /profile` — update name/email
    - [ ] `POST /lichess/connect` — initiate Lichess OAuth link
    - [ ] `DELETE /lichess/disconnect` — unlink Lichess account
- [ ] Dockerfile for Cloud Run
- [ ] Add `dev:api` script to root `package.json` + concurrently

## Phase 5: Lichess Sync Service

- [ ] Scaffold `apps/sync/` (Node.js + TypeScript)
  - [ ] `package.json` as `@exort/sync`
  - [ ] `src/lichess/client.ts` — Lichess API client (NDJSON streaming)
  - [ ] `src/lichess/parser.ts` — parse NDJSON → typed game objects
  - [ ] `src/lichess/types.ts` — Lichess API response types
  - [ ] `src/sync/service.ts` — delta sync orchestration
  - [ ] `src/sync/mapper.ts` — map Lichess API data → DB schema fields
  - [ ] `src/jobs/enqueue.ts` — enqueue analysis jobs for new games
- [ ] Delta sync logic:
  - [ ] Fetch games since `last_synced_at` from `https://lichess.org/api/games/user/{username}`
  - [ ] Parse NDJSON stream, extract all fields (opponent, color, rated, variant, clock, ratings, status, PGN)
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
  - [ ] Classify each move: blunder (>200cp), mistake (>100cp), inaccuracy (>50cp), good, excellent, brilliant
  - [ ] Store per-move data in `move_evaluations` (eval_cp, best_move_uci, played_move_uci, classification)
  - [ ] Aggregate into `game_metrics`: accuracy, centipawn_loss, blunder/mistake/inaccuracy counts
  - [ ] Estimate overall accuracy (lichess-style formula)
  - [ ] Classify opening (ECO code + name from PGN headers or lookup)
  - [ ] Detect phase-based errors (opening/middlegame/endgame)
- [ ] Write `game_metrics` + `move_evaluations` to PostgreSQL
- [ ] Update `analysis_jobs` status (processing → completed / failed)
- [ ] Dockerfile with:
  - [ ] Stockfish 18 binary
  - [ ] CPU quota limits (`--cpus=1`)
  - [ ] Health check endpoint
- [ ] Concurrency control (process 1-2 games at a time)

## Phase 7: Dashboard UI (Web)

Layout: collapsible sidebar + main content area. Feature module: `$lib/features/dashboard/`.
Sidebar order: Dashboard, Games, Insights, Coach — Settings at bottom.

- [ ] Dashboard layout (`/dashboard`)
  - [ ] Collapsible sidebar (icon-only on collapse, dark bg)
  - [ ] Auth guard (redirect to `/login` if unauthenticated)
  - [ ] `+layout.svelte` with sidebar + `<slot />` content area
  - [ ] Active route highlighting in sidebar
  - [ ] User avatar / name at bottom of sidebar
  - [ ] Mobile: hamburger toggle, slide-in sidebar overlay
- [ ] Dashboard overview (`/dashboard` — index page)
  - [ ] Stat cards: total games synced, average accuracy, blunder rate, games this week
  - [ ] Accuracy trend sparkline (last 30 days)
  - [ ] Recent games list (5 most recent — result, accuracy, opening, click to detail)
  - [ ] Pending analysis count
  - [ ] Quick actions: "Sync games" button, "Ask coach" shortcut
- [ ] Games page (`/dashboard/games`)
  - [ ] Table view: date, opponent, result (W/D/L badge), time control, opening, accuracy, analysis status
  - [ ] Filters: time control, result, date range, opening
  - [ ] Sort: by date, accuracy, blunder count
  - [ ] "Sync new games from Lichess" button
  - [ ] Click row → game detail
  - [ ] Loading skeletons
- [ ] Game detail page (`/dashboard/games/[id]`)
  - [ ] Header: opponent, result, time control, date, opening (ECO + name)
  - [ ] Metrics panel: accuracy %, centipawn loss, blunders/mistakes/inaccuracies counts
  - [ ] Phase breakdown: opening/middlegame/endgame error counts (from phase_errors JSONB)
  - [ ] Move list with per-move eval bar (stretch goal)
  - [ ] "Ask coach about this game" button → opens chat with game context
- [ ] Insights page (`/dashboard/insights`)
  - [ ] Accuracy over time line chart (weekly/monthly toggle)
  - [ ] Blunder rate trend line chart
  - [ ] Opening breakdown: bar/pie chart of most played openings with win rate
  - [ ] Time control comparison: accuracy by bullet/blitz/rapid/classical
  - [ ] Weakness summary: auto-derived text ("You blunder most in the endgame", etc.)
- [ ] Settings page (`/dashboard/settings`)
  - [ ] Profile: name, email (editable)
  - [ ] Lichess connection: connected username, last synced, connect/disconnect button
  - [ ] Account: change password, delete account

## Phase 8: RAG Chat (Coach)

Feature module: `$lib/features/coach/`. Route: `/dashboard/coach`.

- [ ] Coach page (`/dashboard/coach`)
  - [ ] Session list (left sub-panel or tabs)
  - [ ] Chat thread: user + assistant messages, markdown rendering
  - [ ] Input bar with send button
  - [ ] Suggested prompts: "What are my biggest weaknesses?", "How can I improve my endgame?", "Analyze my opening repertoire"
  - [ ] Context indicator: shows what data the coach sees (last N games, metrics summary)
  - [ ] Streaming response display
- [ ] API integration (routes defined in Phase 4):
  - [ ] On message send, retrieve structured context from PostgreSQL:
    - [ ] Recent N games with metrics
    - [ ] Top blunders / worst games (from move_evaluations)
    - [ ] Opening frequency stats
    - [ ] Trend aggregates (improvement/decline)
    - [ ] If game_id linked: full game metrics + move evaluations for that game
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
- [ ] Pub/Sub for job dispatch:
  - [ ] Topic: `analysis-jobs` (sync publishes, worker subscribes)
  - [ ] Push subscription to worker or pull from VPS
- [ ] Deploy on Coolify VPS:
  - [ ] PostgreSQL 16 (strong password, restricted access, backup strategy)
  - [ ] `worker` — Docker with Stockfish binary, CPU quotas
  - [ ] Coolify reverse proxy + SSL
  - [ ] Cloud Run services connect to VPS Postgres over public IP (no Cloud SQL needed)
- [ ] Terraform IaC:
  - [ ] Cloud Run services, Pub/Sub topics, Artifact Registry
  - [ ] Environment variables and IAM roles
- [ ] CI/CD (GitHub Actions):
  - [ ] Build + deploy Cloud Run services on push to main
  - [ ] Per-service triggers (only redeploy changed services)
  - [ ] Coolify webhook or manual deploy for VPS services
- [ ] End-to-end smoke test on production

## Phase 10: Testing

Tests colocated with features: `features/[name]/__tests__/[name].test.ts`

- [ ] API integration tests (Vitest + supertest):
  - [ ] `games.test.ts` — list, detail, filters, pagination, move evaluations
  - [ ] `metrics.test.ts` — summary aggregates, trends time-series
  - [ ] `coach.test.ts` — session CRUD, message send/receive
  - [ ] `profile.test.ts` — get/update profile, lichess connect/disconnect
  - [ ] `analysis.test.ts` — enqueue job, poll status
  - [ ] `auth.test.ts` — middleware rejects invalid tokens, forwards valid sessions
- [ ] Sync service tests (Vitest):
  - [ ] `lichess-client.test.ts` — NDJSON parsing, rate limit handling (mocked HTTP)
  - [ ] `mapper.test.ts` — Lichess API response → DB schema mapping
  - [ ] `sync-service.test.ts` — delta sync logic, idempotent upserts (mocked Prisma)
- [ ] Worker unit tests (pytest):
  - [ ] `test_analysis.py` — Stockfish eval pipeline, centipawn loss calculation
  - [ ] `test_classification.py` — move classification thresholds (blunder/mistake/inaccuracy)
  - [ ] `test_accuracy.py` — overall accuracy formula
  - [ ] `test_phase_detection.py` — opening/middlegame/endgame boundary detection
- [ ] Web E2E tests (Vitest + Playwright):
  - [ ] Auth flow: register → login → session validation → dashboard redirect
  - [ ] Dashboard: sidebar navigation, page rendering

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
- [x] **Pub/Sub job dispatch** — Cloud Run sync → Pub/Sub → VPS worker (event-driven, showcases GCP)
- [x] **Structured SQL RAG** — chess metrics are structured, not prose
- [x] **Gemini 2.5 Flash** — long context, low latency, cost-effective
- [x] **Hybrid deploy** — Cloud Run (stateless) + Coolify VPS (Postgres + Stockfish worker)
- [x] **Terraform** — IaC for all GCP resources

- [x] **Shared `packages/db`** — single Prisma schema consumed by both `web` and `api`
- [x] **Coolify** — self-hosted PaaS for VPS (Postgres, worker), reverse proxy + SSL
- [x] **Feature-based structure** — `features/[name]/` with barrel exports, both frontend and backend
- [x] **Vitest over Jest** — native ESM, faster (Vite pipeline), same API, consistent across all TS services
- [x] **supertest** — HTTP assertion lib for Express integration tests (pairs with Vitest, not a replacement)
- [x] **pytest** — Python standard for worker tests (Stockfish pipeline)
- [x] **Zod** — runtime validation for all API request/response schemas (TypeScript-native, pairs with Prisma)
