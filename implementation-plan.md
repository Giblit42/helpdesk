# Implementation Plan

Based on [project-scope.md](project-scope.md) and [tech-stack.md](tech-stack.md).

Each phase ends with something runnable and testable. Tasks are sized to roughly one sitting / one PR each.

**Proposed layout** (npm workspaces monorepo):

```
apps/web        React + Vite frontend
apps/server     Express API + pg-boss worker (two entrypoints, one codebase)
packages/shared Shared TS types, enums, zod schemas
```

---

## Phase 0 — Project Setup

- [ ] 0.1 Remove the Java scaffold (`src/App.java`, `lib/`, `.vscode/settings.json` Java settings, VS Code Java README)
- [ ] 0.2 `git init`, add `.gitignore`, `.editorconfig`, `.nvmrc` (Node LTS)
- [ ] 0.3 Create npm workspaces root with `apps/web`, `apps/server`, `packages/shared`
- [ ] 0.4 Shared TypeScript config (`tsconfig.base.json`), ESLint, Prettier
- [ ] 0.5 Scaffold `apps/server`: Express + TS, `tsx` for dev, `/health` endpoint
- [ ] 0.6 Scaffold `apps/web`: Vite + React + TS, Tailwind, shadcn/ui init
- [ ] 0.7 Wire Vite dev proxy `/api` → Express
- [ ] 0.8 `docker-compose.yml` with local PostgreSQL
- [ ] 0.9 Env config: `.env.example`, validated loader (zod) in server
- [ ] 0.10 Vitest set up in server and shared; one passing sample test
- [ ] 0.11 CI workflow (lint, typecheck, test)

**Done when:** `npm run dev` starts web + API, web page calls `/api/health` successfully, CI is green.

---

## Phase 1 — Database & Authentication

- [ ] 1.1 Add Prisma; define `Role` enum and `User` model (email, name, passwordHash, role, active, timestamps)
- [ ] 1.2 Define `Session` model (opaque id, userId, expiresAt)
- [ ] 1.3 Initial migration
- [ ] 1.4 Seed script: create admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (idempotent)
- [ ] 1.5 Password hashing utility (argon2) + unit tests
- [ ] 1.6 Session service: create, lookup, delete, delete-all-for-user
- [ ] 1.7 `POST /api/auth/login` — sets `HttpOnly; Secure; SameSite` cookie
- [ ] 1.8 `POST /api/auth/logout` and `GET /api/auth/me`
- [ ] 1.9 `requireAuth` and `requireRole('ADMIN')` middleware
- [ ] 1.10 Login rate limiting + CSRF protection strategy (SameSite + origin check)
- [ ] 1.11 API tests for login/logout/me/middleware
- [ ] 1.12 Frontend: TanStack Query setup, API client, login page
- [ ] 1.13 Frontend: auth context, protected routes, app shell (sidebar/nav, logout)

**Done when:** seeded admin can log in and out; protected routes redirect unauthenticated users.

---

## Phase 2 — User Management (Admin only)

- [ ] 2.1 `GET /api/users` (admin)
- [ ] 2.2 `POST /api/users` — create agent (zod-validated)
- [ ] 2.3 `PATCH /api/users/:id` — edit name/email, reset password
- [ ] 2.4 Deactivate/reactivate agent; deactivation deletes their sessions
- [ ] 2.5 Block inactive users at login; prevent admin from deactivating themselves
- [ ] 2.6 API tests incl. agent-forbidden cases
- [ ] 2.7 Frontend: users table page (admin-only nav item)
- [ ] 2.8 Frontend: create/edit agent dialogs, deactivate confirmation

**Done when:** admin can create an agent, the agent can log in, and deactivating them kicks them out immediately.

---

## Phase 3 — Tickets Core (manual, no email/AI yet)

- [ ] 3.1 Prisma: `TicketStatus` + `TicketCategory` enums, `Ticket` model (subject, requester email/name, status, category nullable, assigneeId, summary, timestamps)
- [ ] 3.2 Prisma: `Message` model (ticketId, direction inbound/outbound, from, body text/html, emailMessageId, inReplyTo, authorUserId, createdAt)
- [ ] 3.3 Migration + dev seed with sample tickets
- [ ] 3.4 Export enums/types/zod schemas from `packages/shared`
- [ ] 3.5 `GET /api/tickets` — server-side pagination, filter (status, category, assignee, search), sort
- [ ] 3.6 `GET /api/tickets/:id` — ticket with message thread
- [ ] 3.7 `PATCH /api/tickets/:id` — status, category, assignee
- [ ] 3.8 API tests for list filters/sorting and updates
- [ ] 3.9 Frontend: ticket list with TanStack Table (columns, sorting, pagination)
- [ ] 3.10 Frontend: filter bar (status, category, assignee, search); sync filters to URL
- [ ] 3.11 Frontend: ticket detail page — header, metadata, message thread
- [ ] 3.12 Frontend: status / category / assignee controls on detail page

**Done when:** seeded tickets can be browsed, filtered, sorted, opened, and updated in the UI.

---

## Phase 4 — Email In & Out

- [ ] 4.1 Postmark account/server setup, inbound domain, sender signature (document in README)
- [ ] 4.2 `POST /api/webhooks/postmark/inbound` — protected by basic auth / secret
- [ ] 4.3 Parse inbound payload → create `Ticket` + first `Message`
- [ ] 4.4 Threading: match `In-Reply-To` / `References` to existing `Message-ID` → append to ticket (and reopen if resolved)
- [ ] 4.5 Idempotency: ignore duplicate webhook deliveries (unique on email Message-ID)
- [ ] 4.6 Webhook tests using recorded Postmark fixture payloads
- [ ] 4.7 Add pg-boss; separate worker entrypoint (`apps/server/src/worker.ts`)
- [ ] 4.8 `send-email` job: send via Postmark with proper `In-Reply-To`/`References`, store outbound `Message`
- [ ] 4.9 `POST /api/tickets/:id/replies` — agent writes reply → enqueue `send-email`
- [ ] 4.10 Frontend: reply composer on ticket detail; show pending/sent/failed state
- [ ] 4.11 `cleanup-sessions` scheduled job

**Done when:** an email sent to the inbound address creates a ticket; an agent reply arrives in the sender's inbox; the sender's reply threads onto the same ticket.

---

## Phase 5 — AI Features

- [ ] 5.1 Claude client module (`@anthropic-ai/sdk`, `claude-opus-5-5`), config, timeouts, error handling
- [ ] 5.2 Knowledge base: markdown files in `knowledge-base/` (or a `KnowledgeArticle` table) + loader
- [ ] 5.3 Shared prompt builder with KB in a cached system block (prompt caching)
- [ ] 5.4 `classify-ticket` job: structured output constrained to the 3 categories; store result
- [ ] 5.5 `summarize-ticket` job: store summary on ticket; re-run when new inbound message arrives
- [ ] 5.6 `suggest-reply` job: draft grounded in KB; store as `ReplyDraft`
- [ ] 5.7 Pipeline: inbound email → enqueue classify + summarize + suggest-reply
- [ ] 5.8 Retries/backoff and per-ticket AI status fields (`pending` / `done` / `failed`)
- [ ] 5.9 Unit tests with mocked Claude client; a few golden-sample prompt tests
- [ ] 5.10 Frontend: show AI category (agent can override), summary panel, AI status indicators
- [ ] 5.11 Frontend: "Use suggested reply" inserts draft into composer; "Regenerate" button
- [ ] 5.12 Polling or refetch-on-interval so AI results appear without reload

**Done when:** a new inbound email is automatically classified, summarized, and has a suggested reply visible in the UI within seconds.

---

## Phase 6 — Automatic Responses

- [ ] 6.1 Define auto-reply policy (e.g. only when KB confidently answers; never for Refund Requests) — confirm with stakeholders
- [ ] 6.2 Extend `suggest-reply` output with a confidence / "can auto-answer" flag (structured output)
- [ ] 6.3 `auto-respond` step: if policy passes, enqueue `send-email` and mark ticket `RESOLVED`
- [ ] 6.4 Global on/off setting (admin) + per-category toggles
- [ ] 6.5 Mark AI-sent messages clearly in the thread; audit log entry
- [ ] 6.6 Tests for policy decisions

**Done when:** eligible tickets get an automatic, KB-grounded reply; others are left for agents.

---

## Phase 7 — Dashboard

- [ ] 7.1 `GET /api/dashboard/stats` — counts by status and category, new today, AI auto-resolved rate, avg time to first response
- [ ] 7.2 Frontend: dashboard page with stat tiles
- [ ] 7.3 Charts: tickets over time, breakdown by category
- [ ] 7.4 Quick lists: unassigned open tickets, my open tickets
- [ ] 7.5 Make dashboard the landing page after login

**Done when:** an agent can see the overall state of the queue at a glance and jump into tickets.

---

## Phase 8 — Hardening, E2E & Deployment

- [ ] 8.1 Playwright setup with test DB and seeded users
- [ ] 8.2 E2E: login, admin creates agent, agent logs in
- [ ] 8.3 E2E: inbound webhook → ticket appears → agent replies → status resolved
- [ ] 8.4 E2E: list filtering and sorting
- [ ] 8.5 Security pass: helmet headers, input validation coverage, authz checks on every route, webhook auth
- [ ] 8.6 Structured logging + error handler; log AI token usage/cost
- [ ] 8.7 Dockerfiles for web/API and worker (multi-stage)
- [ ] 8.8 Choose host (Render / Railway / Fly.io), provision managed PostgreSQL
- [ ] 8.9 Deploy pipeline: run `prisma migrate deploy` + admin seed on release
- [ ] 8.10 Point Postmark inbound webhook at production; smoke test end-to-end
- [ ] 8.11 Update README: setup, env vars, scripts, deployment

**Done when:** the app runs in production, receives real emails, and the E2E suite passes in CI.

---

## Later / Out of Scope for v1

- Move classification to Claude Haiku 5.5 to reduce cost
- pgvector + embeddings (e.g. Voyage AI) when the knowledge base outgrows the prompt
- Knowledge base editor in the UI
- SLA tracking, notifications, canned responses
