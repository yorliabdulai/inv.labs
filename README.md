# InvLabs — Ghana Investment Simulator

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ecf8e)](https://supabase.com/)

**InvLabs** is an educational investment simulator for Ghana. Learners practice with **GH₵10,000 in virtual capital**, trade **Ghana Stock Exchange (GSE)** equities with realistic fees, explore **local mutual funds**, and learn with **Ato**—an AI coach focused on education, not financial advice.

> **Disclaimer:** This application is for learning only. It does not provide investment advice, execute real trades, or hold customer funds.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [Database](#database)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [License](#license)

---

## Features

| Area | Description |
|------|-------------|
| **Virtual trading** | Buy/sell GSE stocks with SEC/GSE-style fees; market and limit orders |
| **Mutual funds** | Subscribe and redeem against Ghana fund data and NAV history |
| **Portfolio** | Holdings, cash balance, performance, and transaction history |
| **Ato (AI)** | Context-aware chat, portfolio insights, optional deep research and agent mode |
| **Learn** | Structured courses and onboarding |
| **Gamification** | XP, badges, challenges, and public leaderboard |
| **Partners** | Referral tracking, partner dashboard, admin reporting |
| **PWA** | Installable progressive web app in production builds |

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI | React 19, [Tailwind CSS](https://tailwindcss.com/) v4, [Radix UI](https://www.radix-ui.com/) |
| Backend | Server Actions, Route Handlers |
| Database & auth | [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS) |
| AI | Anthropic / OpenRouter, Serper (research) |
| Email | [Resend](https://resend.com/) |
| Hosting | [Vercel](https://vercel.com/) (recommended) |

---

## Quick start

### Prerequisites

- Node.js **20+**
- npm **10+**
- Supabase project ([create one](https://supabase.com/dashboard))

### Install and run

```bash
git clone <repository-url>
cd investmentsimulator
cp .env.example .env.local
# Edit .env.local with your Supabase keys (see Configuration)
npm install
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)**.

### Apply database migrations

Run SQL files in `supabase/migrations/` **in filename order** via the Supabase SQL Editor (or Supabase CLI). This ensures RLS, trading functions, gamification, and AI cache tables match the application code.

For a detailed setup and PR workflow, see **[CONTRIBUTING.md](./CONTRIBUTING.md)**.

---

## Configuration

Copy [`.env.example`](./.env.example) to `.env.local` and set:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key (browser-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes* | Server/cron only; never expose to client |
| `NEXT_PUBLIC_APP_URL` | Recommended | Base URL for emails and links |
| `ANTHROPIC_API_KEY` | For Ato chat | Primary LLM provider |
| `OPENROUTER_API_KEY` | Optional | Fallback LLM |
| `SERPER_API_KEY` | Optional | Web search for deep research |
| `RESEND_API_KEY` | Optional | Email; logs to console in dev if unset |
| `CRON_SECRET` | Production | Bearer token for `/api/cron/*` routes |
| `NEXT_PUBLIC_ATO_DEEP_RESEARCH_ENABLED` | Optional | Enable research UI/API |
| `NEXT_PUBLIC_ATO_AGENT_MODE_ENABLED` | Optional | Enable agent tooling |

\*Required for cron jobs, some notifications, and research cache writes.

---

## Project structure

```
investmentsimulator/
├── src/
│   ├── app/                 # Routes, layouts, Server Actions, API handlers
│   │   ├── (auth)/          # Login, register
│   │   ├── dashboard/       # Market, portfolio, learn, leaderboard, …
│   │   ├── admin/           # Admin partner tools
│   │   └── api/             # Ato, cron, referrals
│   ├── components/          # UI and feature components
│   └── lib/                 # Supabase, AI, market data, email, utils
├── supabase/
│   ├── migrations/          # Ordered schema changes (source of truth)
│   └── schema*.sql          # Baseline/reference schemas
├── docs/                    # Architecture, security, reviewer guide
├── public/                  # Static assets, PWA output
├── .env.example
├── vercel.json              # Scheduled cron jobs
└── next.config.ts           # PWA, server externals
```

---

## Database

- **Auth:** Supabase Auth; profiles created via `handle_new_user` trigger.
- **Security:** Row Level Security on user data; `public.is_admin()` for elevated access.
- **Trading:** Atomic `execute_stock_trade` function with row-level locking.
- **Migrations:** Always apply `supabase/migrations/*.sql` in order for new environments.

See **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** for data-flow diagrams and cron documentation.

---

## Deployment

### Vercel (recommended)

1. Import the repository and set root directory to `investmentsimulator`.
2. Add environment variables from `.env.example`.
3. Deploy; cron jobs in `vercel.json` run automatically:
   - **08:00 UTC** — re-engagement emails
   - **12:00 UTC** — limit order processing

Configure additional schedules in the Vercel dashboard for:

- `/api/cron/update-mutual-funds`
- `/api/cron/update-macro-snapshot`

Each cron request must include:

```http
Authorization: Bearer <CRON_SECRET>
```

### Build commands

```bash
npm run build
npm run start
```

---

## Documentation

| Guide | Audience |
|-------|----------|
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contributors — setup, conventions, PR checklist |
| [docs/REVIEWER_GUIDE.md](./docs/REVIEWER_GUIDE.md) | Reviewers — suggested review path and feature map |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Engineers — system design and integrations |
| [docs/SECURITY.md](./docs/SECURITY.md) | Security review — auth, RLS, sensitive endpoints |

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # Run ESLint
```

---

## License

Proprietary — all rights reserved unless otherwise specified by the repository owner. Contact maintainers for licensing questions.
