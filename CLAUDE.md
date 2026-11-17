# CLAUDE.md

AI-powered helpdesk / ticket management system. Product scope: [project-scope.md](project-scope.md). Planned stack: [tech-stack.md](tech-stack.md). Phased roadmap with checkboxes: [implementation-plan.md](implementation-plan.md) — check off tasks there as they are completed.

## Documentation: use Context7

Always use the Context7 MCP server (`resolve-library-id` → `query-docs`) to fetch current docs before writing or changing code that uses a library, framework, or tool — even familiar ones (Bun, Express, React, Vite, Tailwind, Prisma, TanStack, pg-boss, Postmark, Anthropic SDK, etc.). Versions in this repo are newer than most training data (Express 5, React 19, Vite 8, Tailwind v4, TypeScript 7), so do not rely on memory for APIs or config. Prefer version-specific library IDs when available.

## Stack & layout

Bun workspaces monorepo (Bun is the runtime, package manager, and test runner — not npm/Node):

```
apps/server      Express 5 API, runs on Bun, port 3000 (src/app.ts builds the app, src/index.ts listens)
apps/web         React 19 + Vite 8 + Tailwind CSS v4, port 5173; Vite proxies /api → :3000
packages/shared  Shared TS types/enums (TicketStatus, TicketCategory, Role, API response types)
```

`@helpdesk/shared` is consumed as raw TypeScript source (`exports` → `./src/index.ts`); no build step.

## Commands (from repo root)

- `bun install` — install all workspaces
- `bun run dev` — API (watch) + web dev server together; `dev:server` / `dev:web` for one side
- `bun test` — Bun test runner (`*.test.ts`, imports from `bun:test`)
- `bun run typecheck` — `tsc --noEmit` in every workspace
- `bun run build` — typecheck + Vite build of the web app
- Add deps per workspace: `bun add <pkg> --cwd apps/server` (or `apps/web`)

## Conventions

- TypeScript strict, shared base config in `tsconfig.base.json` (bundler resolution, `verbatimModuleSyntax` → use `import type` for types, `.ts` extensions in relative imports).
- All API routes live under `/api`. Unknown `/api/*` returns JSON 404; errors go through the central error handler (Express 5 forwards async rejections automatically).
- Types shared between client and server go in `packages/shared`, not duplicated.
- Server tests start the app on port 0 via `createApp()` and hit it with `fetch`.
- Before finishing a change, run `bun run typecheck` and `bun test`.
