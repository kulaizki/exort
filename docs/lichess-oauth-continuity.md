# Lichess OAuth2 PKCE Integration

## Main Goal
Enable "Sign in with Lichess" via OAuth2 PKCE using Better Auth's genericOAuth plugin.

## Important Context

### Completed
- Added `genericOAuth` plugin to `apps/web/src/lib/server/auth.ts` with Lichess provider config
- Created `apps/web/src/lib/auth-client.ts` with `genericOAuthClient` for client-side OAuth
- Updated `LoginPage.svelte` and `RegisterPage.svelte` — replaced `<a href="/auth/lichess">` with `<button>` calling `authClient.signIn.oauth2({ providerId: 'lichess', callbackURL: '/dashboard' })`
- Updated `.env.example` with `LICHESS_CLIENT_ID` and `LICHESS_CLIENT_SECRET`
- `pnpm -F @exort/web check` passes (0 errors, 0 warnings)
- Dev server starts without errors

### Key Decisions
- **No app registration needed** — Lichess uses public clients with PKCE, just pick a unique `clientId` ("exort")
- **No client secret** — empty string, Lichess ignores it
- **PKCE S256** — required by Lichess, handled by Better Auth's `pkce: true`
- **Scopes:** `email:read` only — minimal access, just enough for account creation
- **Email fetched separately** — `/api/account` for profile, `/api/account/email` for email (separate Lichess endpoints)
- **Validated against** heltour (lichess4545), pychess, openingtree — all use same pattern

### Files Changed
- `apps/web/src/lib/server/auth.ts` — genericOAuth plugin with Lichess config
- `apps/web/src/lib/auth-client.ts` — new file, client-side auth
- `apps/web/src/lib/features/auth/components/LoginPage.svelte` — button + OAuth call
- `apps/web/src/lib/features/auth/components/RegisterPage.svelte` — button + OAuth call
- `apps/web/.env.example` — LICHESS_CLIENT_ID, LICHESS_CLIENT_SECRET

### Remaining
- [ ] Store Lichess username in `lichess_accounts` table after OAuth (post-login hook or afterCallback)
- [ ] Test full end-to-end flow against real lichess.org
- [ ] Session management (hooks.server.ts guard for protected routes)

### OAuth Flow
1. Button click → `authClient.signIn.oauth2({ providerId: 'lichess' })`
2. Better Auth generates PKCE challenge, redirects to `lichess.org/oauth`
3. User authorizes → Lichess redirects to `/api/auth/oauth2/callback/lichess`
4. Better Auth exchanges code + verifier for token at `lichess.org/api/token`
5. `getUserInfo` calls `/api/account` + `/api/account/email` with Bearer token
6. User + Account records created, session set, redirect to `/dashboard`
