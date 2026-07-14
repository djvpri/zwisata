# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Warning: Non-standard Next.js version

**Next.js 16** is used here — APIs and conventions differ significantly from training data. Read `node_modules/next/dist/docs/` before writing any Next.js-specific code and heed deprecation notices.

## Commands

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build
npm run lint       # ESLint

# Prisma
npx prisma migrate dev --name <name>   # Create and apply migration
npx prisma generate                    # Regenerate client after schema change
npx prisma studio                      # GUI to inspect DB
```

No test suite exists in this project.

## Environment Variables

Required in `.env.local`:
- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — NextAuth.js secret (for JWT signing)
- `CROSS_APP_SECRET` — Shared secret with Z One SSO hub (JWT for cross-app login)
- `DEMO_RESET_SECRET` — Bearer token for demo reset cron endpoint

## Architecture

**ZWisata** is a multi-tenant SaaS for amusement park operators. Every model in the database has a `tenantId` field. All API routes must filter by `tenantId` from the session — never omit this or data leaks across tenants.

### Tech stack
- **Next.js 16 App Router** — full-stack, no separate backend
- **Prisma 7 + `@prisma/adapter-pg`** — PostgreSQL via connection pool (see `src/lib/prisma.ts`)
- **NextAuth.js v5 (beta)** — JWT sessions, two Credentials providers
- **Tailwind CSS v4** — design tokens in `@theme {}` block in `globals.css`, no `tailwind.config`
- **Bootstrap Icons** — imported globally via CSS, used as `<i className="bi bi-xxx" />`
- **Plus Jakarta Sans** — loaded via `next/font/google` with `variable: '--font-sans'`
- **Zustand** — available but not yet in active use

### Auth flow (`src/lib/auth.ts`)
Two Credentials providers:
1. **`credentials`** — email + bcrypt password, requires `emailVerified` set
2. **`sso`** — JWT token from Z One hub, verified with `CROSS_APP_SECRET`, auto-creates user if new

Session JWT carries `{ id, role, tenantId }`. Session type is extended in `src/types/next-auth.d.ts`.

### Route guards (`src/lib/guard.ts`)
Every API route calls one of:
- `requireSession()` — any authenticated user
- `requireAdmin()` — role must be `'ADMIN'`

Both return the session or `null`. Pattern:
```ts
const session = await requireSession()
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
const tenantId = session.user.tenantId
```

### Dashboard layout
`src/app/dashboard/layout.tsx` — client component with a dark sidebar (`bg-[#0F172A]`). Desktop: fixed 64px sidebar + `lg:ml-64` content area. Mobile: hamburger overlay. Nav items use `bg-teal-400/[0.12] text-teal-400` when active.

### Pesanan status flow
`MENUNGGU → DIBAYAR → DIPAKAI → SELESAI` or `DIBATALKAN`

Only statuses `DIBAYAR`, `DIPAKAI`, `SELESAI` are counted in revenue reports. The `PATCH /api/pesanan/[id]` validates against the `VALID_STATUS` whitelist.

### Design tokens (Tailwind v4 `@theme`)
Primary color is `#0F766E` (teal). Access via `bg-primary`, `text-primary`, etc. No raw hex in components — use these tokens. Full token list in `src/app/globals.css`.

### Cross-app admin API (`/api/admin/cross-app`)
Protected by `CROSS_APP_SECRET` Bearer token. Used by Z One hub to manage users and tenants remotely. Supports: list/create/delete/reactivate users, create/update/delete tenants, move users between tenants.

### Demo system
- `src/lib/demo-seed.ts` — creates 12 pesanan with varied statuses (`SELESAI`/`DIPAKAI`/`DIBAYAR`/`MENUNGGU`) spread across the last 28 days
- `POST /api/demo/setup` — seeds the canonical `demo@zomet.my.id` tenant (requires `DEMO_RESET_SECRET`)
- `POST /api/demo/seed-tenant` — seeds demo data for the currently logged-in admin's tenant
- `POST /api/demo/reset-daily` — cron-triggered, resets expired demo tenants (every 2 hours)

### Deployment
Deployed on Railway via nixpacks (Node 20). No Dockerfile needed. `prisma generate` runs automatically on `npm install` via `postinstall`.
