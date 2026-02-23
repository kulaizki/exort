# Exort — Implementation Checklist

## Architecture

- **Web:** SvelteKit 2.52 + Svelte 5 + Tailwind 4 + Better Auth + Prisma 7 → Coolify VPS
- **API:** Express + TypeScript + Prisma 7 → Coolify VPS
- **Sync:** Node.js + TypeScript — Lichess delta sync → Coolify VPS
- **Worker:** Python + Stockfish 18 + chess library → Coolify VPS
- **Database:** PostgreSQL 16 → Coolify VPS
- **AI:** Gemini 2.5 Flash (Google AI) — structured SQL RAG

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

## Phase 2: Local Dev + Database Schema ✅

- [x] Docker Compose for local dev (PostgreSQL 16 + pgAdmin optional)
- [x] Create `packages/db` shared package (`@exort/db`):
  - [x] Single Prisma schema (owns all models + migrations)
  - [x] Generated client exported for `web` and `api` to consume
  - [x] Move Better Auth models from `apps/web/prisma/` into shared schema
- [x] Design PostgreSQL schema:
  - [x] `users` (Better Auth managed)
  - [x] `lichess_accounts` (user_id, lichess_username, last_synced_at)
  - [x] `games` (lichess_game_id PK, user_id, pgn, time_control, result, played_at, opponent, color, rated, variant, clock_initial, clock_increment, player_rating, opponent_rating, status)
  - [x] `analysis_jobs` (id, game_id, status enum [pending/processing/completed/failed], created_at, started_at, completed_at)
  - [x] `game_metrics` (game_id FK, centipawn_loss, accuracy, blunder_count, mistake_count, inaccuracy_count, opening_name, opening_eco, phase_errors JSONB)
  - [x] `move_evaluations` (id, game_id FK, move_number, color, eval_cp, best_move_uci, played_move_uci, classification enum [blunder/mistake/inaccuracy/good/excellent/brilliant])
  - [x] `chat_sessions` (id, user_id, title, game_id FK nullable, created_at)
  - [x] `chat_messages` (id, session_id FK, role enum [user/assistant], content, context JSONB, created_at)
- [x] Run `prisma db push` against local Postgres
- [x] Add indexes:
  - [x] `games`: user_id, lichess_game_id (unique), played_at, time_control
  - [x] `analysis_jobs`: status, game_id
  - [x] `game_metrics`: game_id
  - [x] `move_evaluations`: game_id, (game_id + move_number) composite
  - [x] `chat_sessions`: user_id
  - [x] `chat_messages`: session_id
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
- [x] Lichess OAuth2 login ("Sign in with Lichess"):
  - [x] ~~Register Lichess OAuth app~~ (not needed — Lichess uses PKCE public clients)
  - [x] Add Lichess as custom OAuth provider in Better Auth (genericOAuth plugin)
  - [x] Auto-link Lichess username on OAuth login (no manual entry needed)
  - [x] Store in `lichess_accounts` table (databaseHooks.account.create.after)
- [x] Session management (hooks.server.ts guard)
- [x] Dashboard layout (sidebar, auth guard)
- [x] Profile page (user info, connected Lichess account)

## Phase 4: API Service (Express) ✅

- [x] Scaffold `apps/api/` (Express + TypeScript)
  - [x] `package.json` as `@exort/api`
  - [x] `src/index.ts` entry point (Express app, middleware registration, route mounting)
  - [x] `src/config/index.ts` — env config with Zod validation
  - [x] Express app with `/health` route
  - [x] Import Prisma client from `@exort/db`
- [x] Feature-based structure (`src/features/`):
  - [x] Each feature: `router.ts` (HTTP) → `service.ts` (logic) → Prisma (data)
  - [x] `schema.ts` per feature — Zod request/response validation
  - [x] Barrel exports: `features/[name]/index.ts` → `features/index.ts`
  - [x] Features: games, metrics, sync, analysis, coach, profile, lichess
- [x] Middleware (`src/middleware/`):
  - [x] `auth.ts` — session validation (Better Auth token check against session table)
  - [x] `cors.ts` — CORS config (allow web origin)
  - [x] `error.ts` — global error handler (Zod errors → 400, unknown → 500)
- [x] Auth strategy (web → api):
  - [x] SvelteKit server-side load functions call API with forwarded session token
  - [x] Express middleware validates token against Better Auth session table
- [x] Routes:
  - [x] **Games:**
    - [x] `GET /games` — list user's games (paginated, filterable by time_control, result, date range, opening)
    - [x] `GET /games/:id` — game detail + metrics + move evaluations
  - [x] **Metrics:**
    - [x] `GET /metrics/summary` — aggregate stats (avg accuracy, blunder/mistake/inaccuracy rates, opening breakdown)
    - [x] `GET /metrics/trends` — time-series metrics (weekly/monthly accuracy, blunder rate)
  - [x] **Sync:**
    - [x] `POST /sync/trigger` — trigger Lichess sync for user
  - [x] **Analysis:**
    - [x] `POST /analysis/enqueue` — enqueue analysis job for a single game
    - [x] `POST /analysis/batch-enqueue` — enqueue analysis for multiple games (max 50)
    - [x] `GET /analysis/status/:jobId` — poll job status
  - [x] **Coach (Chat):**
    - [x] `POST /chat/sessions` — create new chat session (optional game_id for game-specific coaching)
    - [x] `GET /chat/sessions` — list user's chat sessions
    - [x] `DELETE /chat/sessions/:id` — delete a chat session
    - [x] `GET /chat/sessions/:id/messages` — load messages for a session
    - [x] `POST /chat/sessions/:id/messages` — send message, get AI response (streaming)
  - [x] **Settings:**
    - [x] `GET /profile` — user info + connected Lichess account
    - [x] `PATCH /profile` — update name/email
    - [x] `POST /lichess/connect` — initiate Lichess OAuth link
    - [x] `DELETE /lichess/disconnect` — unlink Lichess account
- [x] Dockerfile for Cloud Run
- [x] Add `dev:api` script to root `package.json` + concurrently

## Phase 5: Lichess Sync Service ✅

- [x] Scaffold `apps/sync/` (Node.js + TypeScript)
  - [x] `package.json` as `@exort/sync`
  - [x] `src/lichess/client.ts` — Lichess API client (NDJSON streaming)
  - [x] `src/lichess/parser.ts` — parse NDJSON → typed game objects
  - [x] `src/lichess/types.ts` — Lichess API response types
  - [x] `src/sync/service.ts` — delta sync orchestration
  - [x] `src/sync/mapper.ts` — map Lichess API data → DB schema fields
  - [x] `src/jobs/enqueue.ts` — enqueue analysis jobs for new games
- [x] Delta sync logic:
  - [x] Fetch games since `last_synced_at` from `https://lichess.org/api/games/user/{username}`
  - [x] Parse NDJSON stream, extract all fields (opponent, color, rated, variant, clock, ratings, status, PGN)
  - [x] Idempotent upsert games (ON CONFLICT lichess_game_id DO NOTHING)
  - [x] Update `last_synced_at` in `lichess_accounts`
- [x] Rate limit handling (Lichess API: respect 429 + `X-RateLimit-*` headers)
- [x] Retry with exponential backoff
- [x] ~~Enqueue analysis jobs for new games~~ (removed — analysis is now on-demand via API)
- [x] Trigger mechanism:
  - [x] HTTP endpoint (called by API on user request)
  - [ ] Optional: Cloud Scheduler cron (periodic sync for all users)
- [x] Dockerfile for Cloud Run
- [x] Add `dev:sync` script to root + concurrently

## Phase 6: Stockfish Worker ✅

- [x] Scaffold `apps/worker/` (Python)
  - [x] `requirements.txt` (chess, stockfish wrapper, psycopg2)
  - [x] Poll-based job consumer (FOR UPDATE SKIP LOCKED)
- [x] Job queue contract: shared `analysis_jobs` table used by Node.js (INSERT) and Python (consume)
- [x] Stockfish 18 integration:
  - [x] Download/bundle Stockfish 18 binary in Docker image
  - [x] Configure analysis depth (depth 20 recommended)
  - [x] Time limit per game (prevent runaway analysis)
- [x] Analysis pipeline per game:
  - [x] Parse PGN using `chess` library
  - [x] Run Stockfish evaluation on each move
  - [x] Compute centipawn loss per move
  - [x] Classify each move: blunder (>300cp), mistake (>100cp), inaccuracy (>50cp), good, excellent, brilliant
  - [x] Store per-move data in `move_evaluations` (eval_cp, best_move_uci, played_move_uci, classification)
  - [x] Aggregate into `game_metrics`: accuracy, centipawn_loss, blunder/mistake/inaccuracy counts
  - [x] Estimate overall accuracy (lichess-style formula)
  - [x] Classify opening (ECO code + name from PGN headers or lookup)
  - [x] Detect phase-based errors (opening/middlegame/endgame)
- [x] Write `game_metrics` + `move_evaluations` to PostgreSQL
- [x] Update `analysis_jobs` status (processing → completed / failed)
- [x] Dockerfile with:
  - [x] Stockfish 18 binary
  - [x] CPU quota limits (`--cpus=1`)
  - [x] Health check endpoint
- [x] Concurrency control (process 1-2 games at a time)

## Phase 7: Dashboard UI (Web) ✅

Layout: fixed sidebar + main content area. Feature module: `$lib/features/dashboard/`.
Sidebar order: Dashboard, Games, Insights, Coach, Settings. User info at bottom.

- [x] Dashboard layout (`/dashboard`)
  - [x] Fixed-width sidebar (w-56, dark bg)
  - [x] Auth guard (redirect to `/login` if unauthenticated)
  - [x] `(app)` route group with shared `+layout.svelte` (sidebar + auth guard)
  - [x] Active route highlighting in sidebar
  - [x] User avatar / name at bottom of sidebar
  - [x] Mobile: hamburger toggle, slide-in sidebar overlay
- [x] Dashboard overview (`/dashboard` — index page)
  - [x] Stat cards: total games synced, average accuracy, blunder rate, games this week
  - [ ] Accuracy trend sparkline (last 30 days)
  - [x] Recent games list (7 most recent — result, accuracy, opening, click to detail)
  - [ ] Pending analysis count
  - [x] Quick actions: "Sync games" button, "Ask coach" shortcut
- [x] Games page (`/games`)
  - [x] Table view: date, opponent, result (W/D/L badge), time control, opening, accuracy, analysis status
  - [x] Filters: time control, result, date range, opening
  - [x] Sort: by date, accuracy, blunder count
  - [x] "Sync new games from Lichess" button
  - [x] Click row → game detail
  - [x] Checkbox selection with "Analyze" batch action (max 50 games)
  - [x] Selection bar with count, clear, and analyze button
  - [ ] Loading skeletons
- [x] Game detail page (`/games/[id]`)
  - [x] Header: opponent, result, time control, date, opening (ECO + name)
  - [x] Metrics panel: accuracy %, centipawn loss, blunders/mistakes/inaccuracies counts
  - [x] Phase breakdown: opening/middlegame/endgame error counts (from phase_errors JSONB)
  - [x] Move list with per-move eval bar (stretch goal)
  - [x] "Analyze with Stockfish" button (on-demand, shown when not yet analyzed)
  - [x] "Ask coach about this game" button → opens chat with game context
- [x] Insights page (`/insights`)
  - [x] Accuracy over time line chart (weekly/monthly toggle)
  - [x] Blunder rate trend line chart
  - [x] Opening breakdown: bar/pie chart of most played openings with win rate
  - [x] Time control comparison: accuracy by bullet/blitz/rapid/classical
  - [x] Weakness summary: auto-derived text ("You blunder most in the endgame", etc.)
- [x] Settings page (`/settings`)
  - [x] Profile: name, email (editable)
  - [x] Lichess connection: connected username, last synced, connect/disconnect button
  - [x] Account: change password, delete account

## Phase 8: RAG Chat (Coach) ✅

Feature module: `$lib/features/coach/`. Route: `/coach`.

- [x] Coach page (`/coach`)
  - [x] Session list (left sub-panel)
  - [x] Chat thread: user + assistant messages
  - [x] Input bar with send button
  - [x] Suggested prompts: "What are my biggest weaknesses?", "How can I improve my endgame?", "Analyze my opening repertoire"
  - [ ] Context indicator: shows what data the coach sees (last N games, metrics summary)
  - [ ] Streaming response display (currently non-streaming)
  - [ ] Markdown rendering in assistant messages
- [ ] API integration (routes defined in Phase 4, service logic pending):
  - [ ] On message send, retrieve structured context from PostgreSQL:
    - [ ] Recent N games with metrics
    - [ ] Top blunders / worst games (from move_evaluations)
    - [ ] Opening frequency stats
    - [ ] Trend aggregates (improvement/decline)
    - [ ] If game_id linked: full game metrics + move evaluations for that game
  - [ ] Build context payload (structured JSON)
  - [ ] Call Gemini 2.5 Flash via Google AI API with system prompt + context + user question
  - [ ] System prompt: chess coach persona, reference metrics, give actionable advice
  - [ ] Store message + response in `chat_messages`
  - [ ] Return response (streaming preferred)
- [ ] Context limits (don't exceed token budget — trim oldest games first)

## Phase 9: Deploy

All services on Coolify VPS. No external cloud dependencies.

- [x] Deploy `exort-postgres` on Coolify VPS:
  - [x] PostgreSQL 16 (postgres:16-alpine, strong password, persistent volume)
  - [x] Port mapping `5433:5432` for remote `prisma db push` — remove after setup
  - [x] Run `prisma db push` against remote DB to create tables
- [x] Deploy `exort-worker` on Coolify VPS:
  - [x] GitHub repo, Dockerfile build pack, base dir `/apps/worker`
  - [x] Environment variables (DATABASE_URL internal, ANALYSIS_DEPTH, POLL_INTERVAL, MAX_CONCURRENT)
- [x] Deploy `exort-web` on Coolify VPS:
  - [x] GitHub repo, Dockerfile build pack, base dir `/apps/web`
  - [x] Environment variables (DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, ORIGIN)
  - [x] Domain: `exort.fitzsixto.com`
- [x] Deploy `exort-api` on Coolify VPS:
  - [x] GitHub repo, Dockerfile build pack, base dir `/apps/api`
  - [x] Environment variables (DATABASE_URL, GEMINI_API_KEY, CORS_ORIGIN, SYNC_SERVICE_URL, SYNC_SECRET)
  - [x] Domain: `api.exort.fitzsixto.com`
- [x] Deploy `exort-sync` on Coolify VPS:
  - [x] GitHub repo, Dockerfile build pack, base dir `/apps/sync`
  - [x] Environment variables (DATABASE_URL, SYNC_SECRET)
  - [x] Domain: `sync.exort.fitzsixto.com` (shared-secret auth via `X-Sync-Secret` header)
- [x] Coolify reverse proxy + SSL (wildcard `*.fitzsixto.com`)
- [x] CI/CD: Coolify GitHub webhook auto-deploy on push to main
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

## Docker Deployment Fixes (Resolved)

All three services (web, api, sync) use a 3-stage Dockerfile pattern: **builder** (pnpm install + build) → **deps** (npm install --omit=dev for flat prod node_modules) → **runtime** (minimal image with build output + prod deps).

Key issues resolved during Coolify deployment:

- **`$env/static/private` requires env at build time** — switched `prisma.ts` to `$env/dynamic/private` so `DATABASE_URL` is read at runtime, not inlined during `vite build`
- **BetterAuthError during build** — guarded `betterAuth()` init with `building` flag from `$app/environment` to skip during SSR build
- **npm can't resolve `workspace:*` protocol** — added node one-liner in deps stage to strip workspace deps from `package.json` before `npm install`
- **`dotenv` missing at runtime** — moved from devDependencies to dependencies in `apps/api/package.json`
- **`TS2742` type inference error in sync** — added explicit `Express` type annotation in `apps/sync/src/index.ts`
- **`@exort/db` not loadable at runtime** — `packages/db` has `"main": "src/index.ts"` (TypeScript), Node.js 20 can't load `.ts`. Fixed by bundling `@exort/db` with esbuild into a single JS file during Docker build, copied to `node_modules/@exort/db` in runtime stage. `@prisma/*` externalized
- **`esbuild: not found` in Docker** — pnpm strict hoisting doesn't expose transitive binaries. Added esbuild to root `package.json` devDependencies
- **`@prisma/client` missing at runtime** — esbuild bundle externalizes `@prisma/*`, but `@prisma/client` wasn't a direct dep of `apps/api`. Added as direct dependency so `npm install --omit=dev` installs it

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
- [x] **Postgres-backed job queue** — poll-based with `FOR UPDATE SKIP LOCKED`, no extra infra needed
- [x] **Structured SQL RAG** — chess metrics are structured, not prose
- [x] **Gemini 2.5 Flash** — long context, low latency, cost-effective
- [x] **All-in-one VPS deploy** — all services on Coolify VPS, no external cloud dependencies

- [x] **Shared `packages/db`** — single Prisma schema consumed by both `web` and `api`
- [x] **Coolify** — self-hosted PaaS for all services (reverse proxy, SSL, GitHub webhook deploys)
- [x] **Feature-based structure** — `features/[name]/` with barrel exports, both frontend and backend
- [x] **Vitest over Jest** — native ESM, faster (Vite pipeline), same API, consistent across all TS services
- [x] **supertest** — HTTP assertion lib for Express integration tests (pairs with Vitest, not a replacement)
- [x] **pytest** — Python standard for worker tests (Stockfish pipeline)
- [x] **Zod** — runtime validation for all API request/response schemas (TypeScript-native, pairs with Prisma)
- [x] **Shared-secret auth for internal services** — API ↔ Sync communicate via `X-Sync-Secret` header, stable domain routing through Traefik
- [x] **On-demand analysis** — user-triggered (single or batch max 50), not auto-enqueued on sync
