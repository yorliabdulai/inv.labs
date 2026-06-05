# Contributing

Thank you for reviewing or contributing to **inv.labs**. This guide covers local setup, conventions, and how to submit changes.

## Prerequisites

- **Node.js** 20 LTS (recommended)
- **npm** 10+
- A **Supabase** project (free tier is sufficient for development)
- API keys as listed in [`.env.example`](./.env.example)

## Local setup

```bash
cd investmentsimulator
cp .env.example .env.local
# Fill in Supabase and optional AI/email keys
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database

1. Create a Supabase project.
2. Apply migrations in order from `supabase/migrations/` via the Supabase SQL Editor (or CLI).
3. Optionally run baseline schemas: `supabase/schema.sql`, `schema_mutual_funds.sql`, `schema_ato.sql` if starting from scratch—prefer migrations for production parity.

### Admin user (development)

After signing up, promote your user in SQL:

```sql
UPDATE public.profiles SET role = 'admin' WHERE id = '<your-auth-user-uuid>';
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (webpack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint (Next.js config) |

## Code conventions

- **TypeScript** throughout; strict types for server actions and API handlers.
- **Server Actions** (`"use server"`) for authenticated mutations; avoid exposing service-role keys to the client.
- **Components**: functional React; UI primitives in `src/components/ui/` (shadcn/Radix pattern).
- **Styling**: Tailwind CSS v4; prefer existing design tokens in `globals.css`.
- **Paths**: use `@/` imports mapped in `tsconfig.json`.

## Pull request checklist

- [ ] Changes are scoped to the feature or fix described in the PR
- [ ] No secrets committed (`.env.local`, API keys, service role keys)
- [ ] RLS policies considered for any new Supabase tables
- [ ] Server actions validate auth via `supabase.auth.getUser()`
- [ ] Cron or admin endpoints require `CRON_SECRET` or role checks in production
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds locally for non-trivial changes

## Security

Do not open issues with live credentials. See [docs/SECURITY.md](./docs/SECURITY.md) for reporting and review notes.

## Questions

For architecture and reviewer-focused context, see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) and [docs/REVIEWER_GUIDE.md](./docs/REVIEWER_GUIDE.md).
