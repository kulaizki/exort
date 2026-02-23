# Exort

## Domain

Primary UI (Cloud Run): https://exort.fitzsixto.com
API (Cloud Run): https://api.exort.fitzsixto.com

Exort is a hybrid, cloud-native cognitive performance engine focused on chess improvement.

It automatically syncs games from Lichess, evaluates them using a self-hosted Stockfish worker, extracts structured performance metrics, and provides AI-powered coaching via a structured RAG workflow using the Gemini API.

Exort is intentionally architected to demonstrate backend software architecture: microservice separation, event-driven workflows, workload isolation, and practical cloud deployment.

---

## Architectural Intent

- Microservice separation (web, api, sync, worker)
- External API delta synchronization (Lichess)
- CPU-bound workload isolation (Stockfish worker)
- Structured RAG (SQL retrieval + LLM synthesis)
- Self-hosted infrastructure (Coolify VPS for all services)
- Production-minded boundaries (idempotency, retries, async jobs)

---

## End-to-End Flow

```
User authenticates on web
  -> connects Lichess username
  -> sync fetches new games from Lichess
  -> api stores games (idempotent) in Postgres
  -> api enqueues analysis jobs
  -> worker runs Stockfish, stores metrics
  -> user views dashboards on web
  -> user asks questions via chat
  -> api retrieves metrics + calls Gemini API
  -> web displays coaching output
```

---

## Docs

- [tech.md](./tech.md) — tech stack, architecture, deployment model, service details
- [todo.md](./todo.md) — phased implementation checklist
