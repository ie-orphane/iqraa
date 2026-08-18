# اقرأ (Iqraa)

Arabic book-tracking app built with **Next.js**, **Bun**, **Prisma**, and **Supabase Postgres**.

Auth is native (no Auth.js / Better Auth):

- Discord OAuth2
- Telegram OIDC Web Login (BotFather → Bot Settings → Web Login)
- Opaque DB sessions + server-action logout

UI is always Arabic (`rtl`) and light mode.

---

## Prerequisites

- [Bun](https://bun.sh) (`bun --version`)
- [Docker](https://docs.docker.com/get-docker/) (for local Supabase)
- Discord application (OAuth2)
- Telegram bot with **Web Login** client ID + secret from BotFather

---

## Stack overview

| Piece | Role |
|-------|------|
| Next.js (App Router) | App + auth routes |
| Bun | Package manager + scripts |
| Prisma | Schema + migrations + queries |
| Supabase CLI | Local Postgres in development |
| Supabase hosted | Production Postgres |
| Vercel | Production app host (recommended) |
| Zod | Env validation (`src/env.ts`) |

**Migrations:** use **Prisma only**. Do not create parallel Supabase SQL migrations for the same tables.

---

## Environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

| Variable | Required | Notes |
|----------|----------|--------|
| `APP_URL` | Yes | App origin, no trailing slash needed. OAuth callbacks are derived from this. |
| `DATABASE_URL` | Yes | Postgres connection string |
| `SUPABASE_URL` | Yes | Supabase API URL (local: `http://127.0.0.1:54421`) |
| `SUPABASE_SECRET_KEY` | Yes | Service role key for Storage uploads. Local: `bun run supabase:status` |
| `DISCORD_CLIENT_ID` | Yes | Discord OAuth2 client ID |
| `DISCORD_CLIENT_SECRET` | Yes | Discord OAuth2 client secret |
| `TELEGRAM_CLIENT_ID` | Yes | Telegram Web Login client ID |
| `TELEGRAM_CLIENT_SECRET` | Yes | Telegram Web Login client secret |

**Derived (not in env):**

- Discord callback → `{APP_URL}/api/auth/callback/discord`
- Telegram callback → `{APP_URL}/api/auth/callback/telegram`

Do **not** set `NODE_ENV` yourself. Next.js / the host sets it.

Env is validated with Zod when server code loads `src/env.ts`. Missing or invalid values fail startup with field errors.

---

## Development setup

### 1. Install dependencies

```bash
bun install
```

### 2. Configure env

```bash
cp .env.example .env.local
```

Fill Discord + Telegram secrets. Keep local defaults:

```env
APP_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54422/postgres
```

### 3. Start local Supabase

Docker must be running.

If `~/.supabase` is root-owned (common after sandboxed installs):

```bash
sudo chown -R "$USER" ~/.supabase
```

Then:

```bash
bun run supabase:start
```

Iqraa uses a dedicated local port range (so it does not clash with other Supabase projects on the machine):

| Service | URL / port |
|---------|------------|
| API | `http://127.0.0.1:54421` |
| Postgres | `127.0.0.1:54422` |
| Studio | `http://127.0.0.1:54423` |
| Mail UI | `http://127.0.0.1:54424` |

Useful commands:

```bash
bun run supabase:status
bun run supabase:stop
```

If start fails with **port already allocated**, another project is using the default Supabase ports — iqraa already uses `5442x`. Confirm `DATABASE_URL` matches `supabase/config.toml`.

### 4. Apply database migrations

```bash
bun run db:migrate:deploy
```

Or create/apply interactively while developing schema changes:

```bash
bun run db:migrate
```

Without this step, auth will fail with `The table public.connections does not exist`.

### 5. Register OAuth redirect URLs (local)

**Discord Developer Portal → OAuth2 → Redirects**

- `http://localhost:3000/api/auth/callback/discord`

**Telegram BotFather → Bot Settings → Web Login**

- Domain / redirect for: `http://localhost:3000/api/auth/callback/telegram`

### 6. Run the app

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Script | Purpose |
|--------|---------|
| `bun run dev` | Next.js dev server (Turbopack) |
| `bun run build` | `prisma generate` + production build |
| `bun run start` | Run production build locally |
| `bun run lint` | ESLint |
| `bun run db:generate` | Generate Prisma Client |
| `bun run db:migrate` | Create/apply migrations (dev) |
| `bun run db:migrate:deploy` | Apply committed migrations |
| `bun run db:push` | Push schema without migration files |
| `bun run db:studio` | Prisma Studio |
| `bun run supabase:start` | Start local Supabase |
| `bun run supabase:stop` | Stop local Supabase |
| `bun run supabase:status` | Show local Supabase status |

---

## Auth overview

```text
Discord  → GET /login/discord  → Discord → GET /api/auth/callback/discord
Telegram → GET /login/telegram → oauth.telegram.org → GET /api/auth/callback/telegram
Logout   → server action logout() → clears cookie + session row
```

Tables (Prisma):

- `users`
- `connections` (`discord` \| `telegram`)
- `sessions` (hashed opaque tokens in cookie `iqraa_session`)

---

## Production setup

### Architecture

```text
Browser → Vercel (Next.js)
              └─ Prisma → Supabase hosted Postgres
```

Local Supabase (`supabase start`) is **dev-only**. Do not run it on the server.

### 1. Create hosted Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **Project Settings → Database**.
3. Copy:
   - **Session / direct** connection (port `5432`) — for migrations
   - **Transaction / pooler** connection (port `6543`, often with `?pgbouncer=true`) — for the app runtime

### 2. Configure OAuth for production

Set `APP_URL` to your real domain, e.g. `https://iqraa.example.com`.

Register:

- `https://iqraa.example.com/api/auth/callback/discord`
- `https://iqraa.example.com/api/auth/callback/telegram`

### 3. Set host environment variables (Vercel)

| Variable | Value |
|----------|--------|
| `APP_URL` | `https://your-domain.com` |
| `DATABASE_URL` | **Pooled** URL (`6543`, `pgbouncer=true`) used by the running app |
| `SUPABASE_URL` | Hosted project URL (`https://<project>.supabase.co`) |
| `SUPABASE_SECRET_KEY` | Hosted **service role** key (Storage uploads) |
| `DISCORD_CLIENT_ID` | Production Discord client ID |
| `DISCORD_CLIENT_SECRET` | Production Discord client secret |
| `TELEGRAM_CLIENT_ID` | Telegram Web Login client ID |
| `TELEGRAM_CLIENT_SECRET` | Telegram Web Login client secret |

Optional: keep a separate secret / CI var for the **direct** DB URL used only by migrate.

### 4. Run migrations on production

Use the **direct** Postgres URL (port `5432`), not the pooler:

```bash
DATABASE_URL="postgresql://postgres:...@db.<project>.supabase.co:5432/postgres" \
  bun run db:migrate:deploy
```

Run this before or as part of deploy (CI step). `prisma migrate deploy` applies committed files under `prisma/migrations/` with no prompts.

### 5. Deploy the app

```bash
# Example: Vercel
# Connect the Git repo, set env vars above, deploy
```

Or build locally (Node is more reliable than Bun for `next build` on some machines):

```bash
bun run build
bun run start
```

Vercel sets `NODE_ENV=production` automatically.

### 6. Smoke test

1. Open production URL
2. Sign in with Discord
3. Sign in with Telegram (separate browser / account as needed)
4. Confirm home shows user + **تسجيل الخروج**
5. Log out and confirm session is cleared

---

## Migrations policy

| Environment | Command |
|-------------|---------|
| Local / feature work | `bun run db:migrate` |
| Production / CI | `bun run db:migrate:deploy` |

Prisma owns schema. Supabase Studio can browse data, but schema changes go through Prisma migrations committed to git.

Book covers are stored in a public Supabase Storage bucket named `covers` (max 11MB). Local: defined in `supabase/config.toml`. Hosted: created automatically on first upload, or create it once in Storage.

---
