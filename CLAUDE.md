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

## Branding

- Dark theme only (#0A0A0A bg)
- Gold accent (#FFB800), no gradients on text
- Manrope font (self-hosted, 400/500/600/700)
- Minimal border radius: `rounded-sm` (4px), `rounded` (6px) only
- No heavy shadows or glow effects

## Commands

- `pnpm dev` — run all services via concurrently
- `pnpm -F @exort/web dev` — web only
- `pnpm -F @exort/web check` — svelte-check
- `pnpm -F @exort/web db:push` — prisma db push
- `pnpm -F @exort/web db:studio` — prisma studio

## Conventions

- Conventional commits (single line, scoped)
- Svelte 5 runes ($state, $derived, $effect), no legacy stores
- Tailwind 4 with @theme for custom tokens
- Server deps can go in devDependencies (SvelteKit bundles them)
