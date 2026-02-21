# Database Workflow

## Overview

Exort uses **Prisma 7** with **PostgreSQL**. Schema changes are managed via Prisma Migrate — migrations are created locally and auto-applied on deploy.

## Dev Workflow

### Making schema changes

1. Edit the schema:
   ```
   packages/db/prisma/schema.prisma
   ```

2. Generate a migration:
   ```bash
   cd packages/db
   npx prisma migrate dev --name describe_your_change
   ```
   This creates a SQL migration file in `prisma/migrations/` and applies it to your local DB.

3. Push your code (the migration file is committed with it):
   ```bash
   git add -A && git commit -m "feat(db): add new_field to game" && git push
   ```

4. Coolify deploys the API — the entrypoint auto-runs `prisma migrate deploy`, which applies pending migrations to production.

**That's it.** No manual steps against production.

### Other useful commands

| Command | What it does |
|---------|-------------|
| `cd packages/db && npx prisma migrate dev --name name` | Create a new migration |
| `cd packages/db && npx prisma migrate dev` | Apply pending migrations locally |
| `cd packages/db && npx prisma db push` | Quick-sync schema to local DB (no migration file, dev only) |
| `cd packages/db && npx prisma studio` | Open DB browser |
| `cd packages/db && npx prisma generate` | Regenerate Prisma Client |
| `cd packages/db && npx prisma migrate status` | Check migration status |

### When to use `db push` vs `migrate dev`

- **`db push`** — prototyping locally, throwaway DBs, quick iteration. No migration history.
- **`migrate dev`** — any change that will go to production. Creates a versioned migration file.

**Rule of thumb:** If the change will be deployed, use `migrate dev`.

## How It Works in Production

The API Dockerfile has an entrypoint that runs before the server starts:

```
prisma migrate deploy → node dist/index.js
```

`prisma migrate deploy`:
- Checks the `_prisma_migrations` table for applied migrations
- Applies any new migration files that haven't been run yet
- If all migrations are already applied, it's a no-op (fast)
- Never generates new migrations — only applies existing ones

## Initial Setup (One-Time)

The production DB was originally created with `db push` (no migration history). To baseline it:

```bash
# From packages/db — run once against production
DATABASE_URL="postgresql://user:pass@host:5432/exort" npx prisma migrate resolve --applied 0_init
```

This tells Prisma "the `0_init` migration is already applied" so it won't try to re-create existing tables. After this, all future migrations auto-apply on deploy.

## Prisma Config

Located at `packages/db/prisma.config.ts`:

```ts
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL }
});
```

The `DATABASE_URL` env var is set by Coolify for production and by `.env` for local dev.

## File Structure

```
packages/db/
├── prisma/
│   ├── schema.prisma           # the schema (source of truth)
│   └── migrations/
│       ├── migration_lock.toml  # provider lock
│       └── 0_init/
│           └── migration.sql    # baseline migration
├── prisma.config.ts             # Prisma config
├── src/
│   ├── index.ts                 # re-exports PrismaClient
│   └── generated/prisma/        # auto-generated client (gitignored)
└── package.json
```
