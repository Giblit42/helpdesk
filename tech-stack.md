# Tech Stack

## Overview

A single TypeScript codebase across frontend and backend, with PostgreSQL at the center to keep infrastructure minimal.

| Layer | Choice |
|---|---|
| Language | TypeScript (frontend and backend) |
| Frontend | React + Vite, Tailwind CSS, shadcn/ui |
| Data fetching / tables | TanStack Query + TanStack Table |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma |
| Background jobs | pg-boss (Postgres-backed queue) |
| Authentication | Email/password with database sessions |
| Email | Postmark (inbound webhook + outbound sending) |
| AI | Claude API via `@anthropic-ai/sdk` (`claude-opus-5-5`) |
| Testing | Vitest (unit/API), Playwright (end-to-end) |
| Deployment | Docker → Render, Railway, or Fly.io |

## Frontend

- **React + Vite** with TypeScript.
- **Tailwind CSS** and **shadcn/ui** for UI components (tables, forms, dialogs).
- **TanStack Query** for server state and **TanStack Table** for the ticket list (filtering, sorting, pagination).

## Backend

- **Node.js + Express** REST API.
- Also hosts the inbound email webhook endpoint.
- Shares TypeScript types (ticket, status, category, role) with the frontend.

## Database

- **PostgreSQL**, accessed through **Prisma**.
- Ticket status (`OPEN`, `RESOLVED`, `CLOSED`), category (`GENERAL_QUESTION`, `TECHNICAL_QUESTION`, `REFUND_REQUEST`), and user role (`ADMIN`, `AGENT`) are modeled as Prisma enums.

## Authentication

- Email/password login with **database sessions**.
- Passwords are hashed (e.g. argon2 or bcrypt), never stored in plain text.
- On login, a session record is created in a `Session` table in PostgreSQL. The browser receives only an opaque session ID in an `HttpOnly`, `Secure`, `SameSite` cookie.
- Each request looks up the session in the database to identify the user and their role.
- Logout deletes the session row. Expired sessions are cleaned up periodically by a background job.
- Deactivating an agent can immediately revoke access by deleting their sessions.
- **Initial admin:** created on first deploy by a seed script that reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from environment variables. The admin then creates agent accounts.

## Background Jobs

- **pg-boss** runs jobs on the same PostgreSQL database (no Redis).
- AI classification, summarization, reply drafting, and outbound email run as jobs so web requests never wait on them, and failed jobs retry automatically.
- Flow: email arrives → ticket created immediately → job runs AI processing → results appear in the UI.

## Email

- **Postmark** inbound webhook delivers incoming emails as parsed JSON.
- Postmark also sends outbound replies.
- Replies are threaded onto existing tickets using the `Message-ID` / `In-Reply-To` headers.

## AI

- **Claude API** via the official `@anthropic-ai/sdk`, using `claude-opus-5-5`.
- **Classification:** structured outputs so the result is always one of the three categories.
- **Summaries** and **suggested replies:** single API calls per ticket.
- **Knowledge base (v1):** the full knowledge base is included in the prompt with prompt caching. No vector database needed.
- **Knowledge base (later):** if it outgrows the prompt, add pgvector to the existing PostgreSQL database plus an embeddings provider (e.g. Voyage AI).
- Classification could later move to Claude Haiku 5.5 to reduce cost if needed.

## Testing

- **Vitest** for unit and API tests.
- **Playwright** for end-to-end tests.

## Deployment

- Docker images for the web app and the background worker.
- Hosted on Render, Railway, or Fly.io with managed PostgreSQL.
