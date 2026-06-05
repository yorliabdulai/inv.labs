# Security

Overview for security reviewers and maintainers.

## Scope

InvLabs is an **educational simulator**. No real money, brokerage accounts, or securities settlement occur in this application.

## Authentication

- Sessions managed by **Supabase Auth** with HTTP-only cookies (`@supabase/ssr`).
- OAuth callback: `src/app/auth/callback/route.ts`.
- Middleware/session refresh: `src/lib/supabase/proxy.ts`.

## Authorization model

| Mechanism | Usage |
|-----------|--------|
| **RLS** | Default enforcement on `profiles`, `transactions`, `holdings`, enrollments, etc. |
| **`is_admin()`** | SECURITY DEFINER function; gates admin policies |
| **`profiles.role`** | `user`, `admin`, `partner` (see auth migration) |
| **Service role** | Server-only: cron jobs, some notifications, research cache writes |

Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or `NEXT_PUBLIC_*` variables.

## Sensitive endpoints

| Endpoint | Protection |
|----------|------------|
| `/api/cron/*` | `Authorization: Bearer $CRON_SECRET` in production |
| `/api/ato/*` | Authenticated user session (verify per route) |
| Admin pages | App-level checks + DB `is_admin()` for data |

When reviewing new API routes, confirm authentication and that service-role usage is justified.

## Trading integrity

- Trades execute via **`execute_stock_trade`** Postgres function (row locks, balance checks).
- Client-submitted prices are used for simulator UX; fees and balances are recomputed server-side.
- Limit-order cron runs with service role; fills should respect stored order constraints.

## AI safety

- System prompts prohibit personalized investment advice (see `ato-service.ts`).
- Deep research uses third-party search (Serper); cache keys should not store raw user secrets.
- Feature flags: `NEXT_PUBLIC_ATO_DEEP_RESEARCH_ENABLED`, `NEXT_PUBLIC_ATO_AGENT_MODE_ENABLED`.

## Reporting vulnerabilities

If you discover a security issue, please **do not** file a public GitHub issue with exploit details. Contact the maintainers privately with:

1. Description and impact
2. Steps to reproduce
3. Suggested fix (if any)

## Dependency hygiene

- Run `npm audit` periodically.
- Pin major framework versions in `package.json` intentionally (Next.js 16, React 19).

## Secrets management

- Use `.env.local` locally (gitignored).
- Use Vercel/hosting environment variables in production.
- Rotate `CRON_SECRET` and Supabase service role if leaked.
