# Exort

## Domain

Primary UI (Cloud Run):
https://exort.fitzsixto.com

API (Cloud Run):
https://api.exort.fitzsixto.com

Exort is a hybrid, cloud-native cognitive performance engine focused on chess improvement.

It automatically syncs games from Lichess, evaluates them using a self-hosted Stockfish worker, extracts structured performance metrics, and provides AI-powered coaching via a structured RAG workflow using Vertex AI (Gemini).

Exort is intentionally architected to demonstrate backend software architecture: microservice separation, event-driven workflows, workload isolation, and practical cloud deployment.

---

## Architectural Intent

Exort is designed to showcase:

- microservice separation (web, api, sync, worker)
- external API delta synchronization (lichess)
- CPU-bound workload isolation (stockfish worker)
- structured RAG (SQL retrieval + LLM synthesis)
- hybrid infrastructure (GCP for stateless services, VPS for compute + DB)
- production-minded boundaries (idempotency, retries, async jobs)

---

## Deployment Model (Option A: Recommended Hybrid)

### GCP (Cloud Run) — Stateless / Elastic Services
- `web` (SvelteKit + Better Auth)
- `api` (Express + TypeScript + Prisma)
- `sync` (Lichess sync service, Node + TypeScript)
- `rag` (RAG chat endpoint; can be a separate service or part of `api`)

### VPS — Compute + Data Layer
- PostgreSQL (primary database)
- `worker` (Python analysis worker + Stockfish)
- Dockerized services with enforced CPU quotas for the worker

Rationale:
- Cloud Run is ideal for stateless API/web services (scale-to-zero, easy deploy)
- Stockfish is CPU-bound and more cost-effective on fixed VPS compute
- Keeping Postgres near the worker reduces network overhead and keeps costs predictable

---

## Monorepo Structure

Recommended repo layout:

exort/
├── apps/
│ ├── web/ # SvelteKit UI + Better Auth (Cloud Run)
│ ├── api/ # Express API + Prisma (Cloud Run)
│ ├── sync/ # Lichess sync service (Cloud Run)
│ └── worker/ # Python + Stockfish analysis worker (VPS)
├── packages/
│ └── shared/ # optional: shared types/contracts (later)
├── infra/
│ └── terraform/ # optional: IaC for GCP (later)
└── docs/
└── overview.md


---

## Services

### 1) web (SvelteKit + Better Auth) — Cloud Run
Responsibilities:
- user authentication (Better Auth)
- connect Lichess username
- dashboards (games, metrics, summaries)
- RAG chat UI

Notes:
- auth is handled in `web`
- API calls use token-based auth (recommended) to avoid cross-site cookie complexity

---

### 2) api (Express + TypeScript + Prisma) — Cloud Run
Responsibilities:
- core REST APIs (users, games, metrics, chat)
- Prisma-based DB access (Postgres on VPS)
- job orchestration (enqueue analysis jobs)
- publishes/consumes events as needed

Key patterns:
- idempotent upserts using Lichess game ID
- transaction-safe writes via Prisma
- clear separation between API and worker compute

---

### 3) sync (Node.js + TypeScript) — Cloud Run
Responsibilities:
- connect to Lichess public API
- incremental delta sync of new games:
  https://lichess.org/api/games/user/{username}
- handle retries + rate limits
- persist new games via `api` (or direct DB writes if preferred)
- trigger analysis by enqueueing jobs / publishing events

Models enterprise-grade external integration:
- delta synchronization
- deduplication
- resilience patterns

---

### 4) worker (Python) — VPS
Responsibilities:
- consume analysis jobs from a queue (initially Postgres-backed)
- run Stockfish for deterministic evaluation
- extract structured metrics:
  - centipawn loss
  - blunder count
  - estimated accuracy
  - opening classification
  - phase-based error detection
- write analysis results back to Postgres

Design characteristics:
- CPU-bound workload isolated
- concurrency limited
- Docker CPU quotas enforced
- async job processing model

Stockfish performs objective evaluation.
LLMs are not used for move computation.

---

## RAG Chat Strategy (v1: Structured Retrieval)

RAG is implemented using structured SQL retrieval, not embeddings.

Flow:
1. user asks a question in chat
2. `api` retrieves relevant structured metrics from Postgres:
   - recent games
   - worst mistakes
   - opening frequencies
   - trend aggregates over time
3. `api` builds a structured context payload
4. `api` calls Vertex Gemini
5. model returns coaching response (prefer structured JSON + display-friendly text)

Embeddings/vector DB are intentionally excluded in v1.
They may be added later for semantic similarity over generated summaries.

---

## End-to-End Flow

User authenticates on `web`  
→ user connects Lichess username  
→ `sync` fetches new games from Lichess  
→ `api` stores games (idempotent) in Postgres  
→ `api` enqueues analysis jobs  
→ `worker` runs Stockfish and stores metrics  
→ user views dashboards on `web`  
→ user asks questions via chat  
→ `api` retrieves metrics + calls Vertex Gemini  
→ `web` displays coaching output  

---

## Tech Stack

### Application
- SvelteKit (TypeScript) + Better Auth
- Node.js + TypeScript + Express
- Prisma ORM
- PostgreSQL (VPS-hosted)
- Python analysis worker
- Stockfish engine (self-hosted)

### Cloud
- GCP Cloud Run (web/api/sync)
- Vertex AI (Gemini)

### Infrastructure
- Docker (all services containerized)
- VPS (Postgres + worker)
- optional: Terraform for GCP resources

---

## Design Principles

- deterministic evaluation (stockfish) separated from generative reasoning (LLM)
- CPU-heavy workloads isolated from API/web services
- idempotent external synchronization
- structured retrieval before LLM synthesis
- hybrid infra chosen for cost/performance realism
- clear service boundaries suitable for interview discussion

---

## Goals

- demonstrate backend architecture and system design skills
- show production-minded integration patterns (retries, dedupe, async jobs)
- demonstrate Prisma relational modeling
- integrate AI via a defensible structured RAG workflow
- provide a real deployed project to reference in technical interviews

---

## Non-Goals (v1)

- embeddings / vector database
- Kubernetes orchestration
- multi-tenant scaling
- heavy frontend polish