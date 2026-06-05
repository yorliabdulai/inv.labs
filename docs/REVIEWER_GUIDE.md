# Reviewer guide

A focused walkthrough for code review, technical assessment, or due diligence.

## What this project is

**InvLabs** is a Ghana-focused investment **simulator**: virtual GH₵, real GSE-style market data, mutual funds, gamified learning, and an AI coach (**Ato**) that teaches without giving financial advice.

## Suggested review order (~30–45 minutes)

1. **Product surface** — `src/app/page.tsx`, `src/app/dashboard/` (market, portfolio, learn).
2. **Trade path** — `src/app/actions/stocks.ts` → `supabase/migrations/20260301_atomic_stock_trades.sql`.
3. **Auth & data access** — `supabase/migrations/20260221_auth_overhaul.sql`, `src/lib/supabase/server.ts`.
4. **AI** — `src/lib/ai/ato-service.ts`, `src/app/api/ato/chat/route.ts`, optional `src/lib/ai/research/pipeline.ts`.
5. **Ops** — `vercel.json`, `src/app/api/cron/`, `.env.example`.
6. **Partners/admin** — `src/app/admin/`, `src/app/actions/partner.ts`.

## Feature matrix

| Feature | Primary code | Database |
|---------|--------------|----------|
| GSE stock trading | `actions/stocks.ts`, `actions/orders.ts` | `execute_stock_trade`, limit orders migration |
| Mutual funds | `actions/mutual-funds.ts` | `schema_mutual_funds.sql` |
| Portfolio & P&L | `actions/portfolio.ts`, `lib/portfolio-utils.ts` | `holdings`, `transactions` |
| Leaderboard | `actions/leaderboard.ts` | `20260328_leaderboard_public_policy.sql` |
| Gamification (XP, badges) | `actions/xp.ts`, `actions/gamification.ts` | `20260225_gamification.sql`, `20260329_gamification_full.sql` |
| Courses | `dashboard/learn/` | `courses`, `enrollments` |
| Challenges & notifications | `actions/challenges.ts`, `actions/notifications.ts` | `20260331_notifications_challenges.sql` |
| Ato chat | `api/ato/chat/` | `schema_ato.sql` |
| Ato deep research | `api/ato/research/`, `lib/ai/research/` | `20260603_ato_deep_research.sql` |
| Referrals & partners | `api/referral-click/`, `actions/partner.ts` | `20260418_referral_system.sql` |
| Email re-engagement | `api/cron/re-engagement/`, `lib/email.ts` | notifications tables |

## Environment variables (quick reference)

See [`.env.example`](../.env.example). Minimum to run locally:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (cron, some server tasks)

Optional but needed for full feature parity:

- `ANTHROPIC_API_KEY` or `OPENROUTER_API_KEY` — Ato chat
- `SERPER_API_KEY` — deep research
- `RESEND_API_KEY` — transactional email
- `CRON_SECRET` — securing cron routes locally/production

## Common review questions

**Is real money involved?**  
No. Balances and instruments are simulated; educational disclaimers are embedded in AI prompts and product copy.

**How are concurrent trades handled?**  
Postgres function locks the profile row and updates cash/holdings atomically.

**Can users read each other’s portfolios?**  
RLS restricts `transactions` and `holdings` to `auth.uid()`. Leaderboard exposes only fields defined in SECURITY DEFINER views/functions.

**What runs on a schedule?**  
See [ARCHITECTURE.md](./ARCHITECTURE.md#cron--background-work). `vercel.json` defines two crons; others are manual or host-configured.

**How is AI constrained?**  
System prompt limits scope to Ghana investing education; out-of-domain queries get a fixed refusal. Agent/trade tools are behind feature flags.

## Testing locally

```bash
npm install
cp .env.example .env.local
# Configure Supabase + keys
npm run dev
```

Smoke test path:

1. Register / log in
2. Dashboard → Market → buy a stock
3. Portfolio shows holding and reduced cash
4. Open Ato chat (mock response if no API key)

```bash
npm run build   # verify production compile
npm run lint
```

Playwright is listed in devDependencies; add specs under `e2e/` if extending automated coverage.

## Documentation index

| Document | Purpose |
|----------|---------|
| [README.md](../README.md) | Project overview and quick start |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Setup and PR conventions |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design and data flow |
| [SECURITY.md](./SECURITY.md) | Threat model and controls |

## Out of scope for this repo

- Live brokerage integration
- KYC / regulatory licensing (simulator only)
- Production incident runbooks (add if operating at scale)
